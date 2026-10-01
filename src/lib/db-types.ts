export type CoreBucket = 'beginner' | 'intermediate' | 'advanced';
export type CoreWordStatus = 'draft' | 'published' | 'retired';
export type AppModuleSlug = 'core-vocabulary' | 'appendix';

export type AppModuleRow = {
  id: string;
  slug: AppModuleSlug | string;
  title: string;
  description: string | null;
  sort_order: number;
  is_enabled: boolean;
};

export type CoreWordRow = {
  id: string;
  lemma: string;
  display_word: string;
  bucket: CoreBucket;
  status: CoreWordStatus;
  list_order: number;
  is_new: boolean;
  confidence: number | null;
  classified_by: 'reference_list' | 'heuristic' | 'model' | 'human' | null;
};
