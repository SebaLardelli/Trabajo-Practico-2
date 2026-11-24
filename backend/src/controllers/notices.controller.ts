import { Request, Response } from "express";
import { isValidObjectId } from "mongoose";
import Notice from "../models/Notice.js";
import { MarkNoticesInput } from "../schemas/loan.schema.js";

export async function listNotices(req: Request, res: Response): Promise<void> {
  const userId = req.user?.id;
  if (!userId) {
    res.status(401).json({ success: false, error: { message: "Sesion requerida" } });
    return;
  }
  try {
    const notices = await Notice.find({ userId }).sort({ createdAt: -1 }).limit(50);
    res.status(200).json({
      data: notices.map((notice) => ({
        _id: String(notice._id),
        kind: notice.kind,
        title: notice.title,
        body: notice.body,
        read: notice.read,
        createdAt: notice.createdAt?.toISOString() ?? new Date().toISOString(),
      })),
    });
  } catch (error) {
    console.error("[notices] error listing:", error);
    res.status(500).json({ success: false, error: { message: "No se pudieron leer los avisos" } });
  }
}

export async function unreadNotices(req: Request, res: Response): Promise<void> {
  const userId = req.user?.id;
  if (!userId) {
    res.status(401).json({ success: false, error: { message: "Sesion requerida" } });
    return;
  }
  try {
    const count = await Notice.countDocuments({ userId, read: false });
    res.status(200).json({ count });
  } catch (error) {
    console.error("[notices] error counting:", error);
    res.status(500).json({ success: false, error: { message: "No se pudieron contar los avisos" } });
  }
}

export async function markNoticesRead(req: Request<Record<string, string>, unknown, MarkNoticesInput>, res: Response): Promise<void> {
  const userId = req.user?.id;
  if (!userId) {
    res.status(401).json({ success: false, error: { message: "Sesion requerida" } });
    return;
  }
  try {
    const ids = (req.body.ids ?? []).filter((id) => isValidObjectId(id));
    const filter = ids.length > 0 ? { userId, _id: { $in: ids } } : { userId, read: false };
    await Notice.updateMany(filter, { $set: { read: true } });
    res.status(204).send();
  } catch (error) {
    console.error("[notices] error marking:", error);
    res.status(500).json({ success: false, error: { message: "No se pudieron marcar los avisos" } });
  }
}
