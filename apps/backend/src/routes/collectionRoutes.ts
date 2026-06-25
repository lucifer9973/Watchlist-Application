import { Router } from "express";
import { prisma } from "../config/prisma.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { HttpError } from "../utils/httpError.js";
import { z } from "zod";

const nameSchema = z.object({
  name: z.string().trim().min(1).max(100)
});

export const createCollectionRoutes = () => {
  const router = Router();

  // List all collections
  router.get(
    "/",
    asyncHandler(async (req, res) => {
      const collections = await prisma.collection.findMany({
        orderBy: { name: "asc" }
      });
      res.json(collections);
    })
  );

  // Create collection
  router.post(
    "/",
    asyncHandler(async (req, res) => {
      const { name } = nameSchema.parse(req.body);

      // Check if it already exists
      const existing = await prisma.collection.findUnique({
        where: { name }
      });

      if (existing) {
        throw new HttpError(409, "Collection already exists");
      }

      const collection = await prisma.collection.create({
        data: { name }
      });

      res.status(201).json(collection);
    })
  );

  // Rename collection
  router.put(
    "/:id",
    asyncHandler(async (req, res) => {
      const id = req.params.id as string;
      const { name } = nameSchema.parse(req.body);

      const oldCollection = await prisma.collection.findUnique({
        where: { id }
      });

      if (!oldCollection) {
        throw new HttpError(404, "Collection not found");
      }

      // Check if target name already exists
      if (name !== oldCollection.name) {
        const existing = await prisma.collection.findUnique({
          where: { name }
        });
        if (existing) {
          throw new HttpError(409, "Collection with this name already exists");
        }
      }

      // Update collection name and all matching items
      const updated = await prisma.$transaction(async (tx) => {
        const coll = await tx.collection.update({
          where: { id },
          data: { name }
        });

        await tx.watchlistItem.updateMany({
          where: { collection: oldCollection.name },
          data: { collection: name }
        });

        return coll;
      });

      res.json(updated);
    })
  );

  // Delete collection
  router.delete(
    "/:id",
    asyncHandler(async (req, res) => {
      const id = req.params.id as string;

      const collection = await prisma.collection.findUnique({
        where: { id }
      });

      if (!collection) {
        throw new HttpError(404, "Collection not found");
      }

      await prisma.$transaction(async (tx) => {
        await tx.collection.delete({
          where: { id }
        });

        await tx.watchlistItem.updateMany({
          where: { collection: collection.name },
          data: { collection: null }
        });
      });

      res.status(204).send();
    })
  );

  return router;
};
