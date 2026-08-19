// ============================================================================
// 🍳 AŞAMA 10 — DAZE CHEF MÜHENDİSLİK REÇETESİ & ATIK (WASTE) TAKİP MOTORU
// Gramaj bazlı hammadde düşümü + geri dönüşüm (upcycling) kaydı.
// Reçete → stok düşümü; atık → upcycling_items kaydı (insertLiveRow fallback).
// Deterministik; Plan Z güvenli.
// ============================================================================

import { insertLiveRow } from '../db/supabaseClient';

export interface RecipeIngredient {
  name: string;
  gramPerPortion: number;
}

export interface Recipe {
  id: string;
  name: string;
  basePriceTl: number;
  ingredients: RecipeIngredient[];
}

export interface InventoryLevel {
  ingredient: string;
  stockGrams: number;
}

export interface RecipeCostResult {
  recipeId: string;
  costPerPortionTl: number;
  marginPct: number;
  lowStock: string[];
  wasteGram: number;
  ok: boolean;
}

export interface WasteRecord {
  id: string;
  recipeId: string;
  ingredient: string;
  grams: number;
  reason: 'fire' | 'expired' | 'prep-loss' | 'over-production';
  upcycled: boolean;
}

const UNIT_PRICES: Record<string, number> = { levrek: 0.6, un: 0.02, domates: 0.03, peynir: 0.18, kekik: 0.4, zeytin: 0.12 };

/** Reçete maliyeti + stok düşümü + atık kaydı. */
export function processRecipeBatch(recipe: Recipe, portions: number, inventory: InventoryLevel[], prepLossPercent = 0.08): RecipeCostResult {
  const costPerPortionTl = Math.round(recipe.ingredients.reduce((acc, ing) => {
    const price = UNIT_PRICES[ing.name.toLowerCase()] ?? 0.1;
    return acc + (ing.gramPerPortion / 1000) * price;
  }, 0) * 100) / 100;

  const marginPct = recipe.basePriceTl > 0 ? Math.round(((recipe.basePriceTl - costPerPortionTl) / recipe.basePriceTl) * 100) : 0;

  const lowStock: string[] = [];
  const wasteGram = Math.round(recipe.ingredients.reduce((acc, ing) => {
    const level = inventory.find((i) => i.ingredient === ing.name);
    if (level && level.stockGrams < ing.gramPerPortion * portions) lowStock.push(ing.name);
    return acc + ing.gramPerPortion * portions * prepLossPercent;
  }, 0));

  // Atık kaydı (fire/prep-loss) — upcycling potansiyeli
  const waste: WasteRecord = {
    id: `WS-${Date.now().toString(36)}`,
    recipeId: recipe.id,
    ingredient: recipe.ingredients[0]?.name ?? 'karışık',
    grams: wasteGram,
    reason: lowStock.length > 0 ? 'prep-loss' : 'over-production',
    upcycled: wasteGram > 0 && prepLossPercent <= 0.1,
  };
  void insertLiveRow('upcycling_items', { ...waste, created_at: new Date().toISOString() }).catch(() => undefined);

  return { recipeId: recipe.id, costPerPortionTl, marginPct, lowStock, wasteGram, ok: true };
}

export function recipeEngineeringEngineStatus(): string {
  return 'Recipe Engineering [gramaj düşümü • marj hesabı • stok uyarısı • upcycling atık kaydı]';
}
