import { Router, Request, Response } from "express";
import { prisma } from "../db";
import { requireAuth } from "../middleware/auth";

const router = Router();

interface CreateCommentBody {
  content: string;
  rating?: number;
}

// Get comments for a song
router.get("/songs/:id/comments", async (req: Request, res: Response) => {
  try {
    const songId = parseInt(req.params.id, 10);

    const comments = await prisma.comment.findMany({
      where: { songId },
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });

    res.json({ comments });
  } catch (error) {
    console.error("Get comments error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Create a comment
router.post("/songs/:id/comments", requireAuth, async (req: Request, res: Response) => {
  try {
    const songId = parseInt(req.params.id, 10);
    const { content, rating } = req.body as CreateCommentBody;

    if (!content || content.trim().length === 0) {
      res.status(400).json({ error: "Comment content is required" });
      return;
    }

    if (rating !== undefined && (rating < 1 || rating > 5)) {
      res.status(400).json({ error: "Rating must be between 1 and 5" });
      return;
    }

    const song = await prisma.song.findUnique({
      where: { id: songId },
    });

    if (!song) {
      res.status(404).json({ error: "Song not found" });
      return;
    }

    const comment = await prisma.comment.create({
      data: {
        content,
        rating: rating || null,
        userId: req.user!.userId,
        songId,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });

    res.status(201).json(comment);
  } catch (error) {
    console.error("Create comment error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Delete a comment (only owner can delete)
router.delete("/comments/:id", requireAuth, async (req: Request, res: Response) => {
  try {
    const commentId = parseInt(req.params.id, 10);
    const userId = req.user!.userId;

    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      res.status(404).json({ error: "Comment not found" });
      return;
    }

    if (comment.userId !== userId) {
      res.status(403).json({ error: "You can only delete your own comments" });
      return;
    }

    await prisma.comment.delete({
      where: { id: commentId },
    });

    res.json({ ok: true });
  } catch (error) {
    console.error("Delete comment error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
