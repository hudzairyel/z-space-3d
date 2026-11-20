import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { authenticate, AuthRequest } from "../middleware/auth.js";
import { deleteFile } from "../utils/storage.js";

const prisma = new PrismaClient();
const router = Router();

// List all models for current user
router.get("/", authenticate, async (req: AuthRequest, res) => {
  try {
    const models = await prisma.model.findMany({
      where: { userId: req.userId! },
      orderBy: { createdAt: "desc" },
    });
    res.json(models);
  } catch {
    res.status(500).json({ error: "Failed to list models" });
  }
});

// Create model record after upload
router.post("/", authenticate, async (req: AuthRequest, res) => {
  try {
    const { name, description, format, filePath, fileSize, vertices, faces } = req.body;
    const model = await prisma.model.create({
      data: {
        userId: req.userId!,
        name: name || "Untitled",
        description,
        format: format || "obj",
        filePath,
        fileSize: fileSize || 0,
        vertices: vertices || null,
        faces: faces || null,
      },
    });
    res.status(201).json(model);
  } catch {
    res.status(500).json({ error: "Failed to create model" });
  }
});

// Get single model
router.get("/:id", authenticate, async (req: AuthRequest, res) => {
  try {
    const model = await prisma.model.findFirst({
      where: { id: req.params.id, userId: req.userId! },
    });
    if (!model) return res.status(404).json({ error: "Model not found" });
    res.json(model);
  } catch {
    res.status(500).json({ error: "Failed to get model" });
  }
});

// Delete model + file
router.delete("/:id", authenticate, async (req: AuthRequest, res) => {
  try {
    const model = await prisma.model.findFirst({
      where: { id: req.params.id, userId: req.userId! },
    });
    if (!model) return res.status(404).json({ error: "Model not found" });
    await deleteFile(model.filePath.split("/").pop()!.split("\\").pop()!);
    await prisma.model.delete({ where: { id: model.id } });
    res.json({ ok: true });
  } catch {
    res.status(500).json({ error: "Failed to delete model" });
  }
});

export default router;
