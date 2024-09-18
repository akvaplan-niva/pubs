export interface SlimPublication {
  published: string; // may be just "yyyy", or "yyyy-mm", or isodate, or date-time string
  printed: string;
  type: string;
  container: string;
  title: string;
  authors: Author[];
  doi: string;
  license: string;
  cites: number;
  pdf: string;
}

export interface Author {
  family: string;
  given: string;
  first?: boolean;
}
