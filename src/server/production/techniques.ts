// =============================================================================
// Técnicas de estampación — CRUD
// =============================================================================

import { prisma } from '@/server/db';

export interface TechniqueData {
  name: string;
  code: string;
  description?: string;
  minQuantity?: number;
  maxColors?: number | null;
  leadTimeDays?: number;
  isActive?: boolean;
}

export const listTechniques = async () => {
  return prisma.printingTechnique.findMany({
    orderBy: { name: 'asc' },
  });
};

export const getActiveTechniques = async () => {
  return prisma.printingTechnique.findMany({
    where: { isActive: true },
    orderBy: { name: 'asc' },
  });
};

export const getTechniqueById = async (id: string) => {
  return prisma.printingTechnique.findUnique({ where: { id } });
};

export const getTechniqueByCode = async (code: string) => {
  return prisma.printingTechnique.findUnique({ where: { code } });
};

export const createTechnique = async (data: TechniqueData) => {
  return prisma.printingTechnique.create({
    data: {
      name: data.name,
      code: data.code,
      description: data.description,
      minQuantity: data.minQuantity ?? 1,
      maxColors: data.maxColors ?? null,
      leadTimeDays: data.leadTimeDays ?? 5,
      isActive: data.isActive ?? true,
    },
  });
};

export const updateTechnique = async (id: string, data: Partial<TechniqueData>) => {
  return prisma.printingTechnique.update({ where: { id }, data });
};

export const deleteTechnique = async (id: string) => {
  return prisma.printingTechnique.update({
    where: { id },
    data: { isActive: false },
  });
};
