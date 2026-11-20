import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { authenticate } from "../middleware/auth.js";
const prisma = new PrismaClient();
const router = Router();
// List generations for current user
router.get("/", authenticate, async (req, res) => {
    try {
        const generations = await prisma.generation.findMany({
            where: { userId: req.userId },
            orderBy: { createdAt: "desc" },
            include: { resultModel: true },
            take: 50,
        });
        res.json(generations);
    }
    catch {
        res.status(500).json({ error: "Failed to list generations" });
    }
});
// Create generation record
router.post("/", authenticate, async (req, res) => {
    try {
        const { prompt, imageUrl, status } = req.body;
        const gen = await prisma.generation.create({
            data: {
                userId: req.userId,
                prompt: prompt || null,
                imageUrl: imageUrl || null,
                status: status || "pending",
            },
            include: { resultModel: true },
        });
        res.status(201).json(gen);
    }
    catch {
        res.status(500).json({ error: "Failed to create generation" });
    }
});
// Update generation status
router.patch("/:id", authenticate, async (req, res) => {
    try {
        const { status, resultModelId } = req.body;
        const gen = await prisma.generation.update({
            where: { id: req.params.id, userId: req.userId },
            data: { status, resultModelId },
            include: { resultModel: true },
        });
        res.json(gen);
    }
    catch {
        res.status(500).json({ error: "Failed to update generation" });
    }
});
export default router;
