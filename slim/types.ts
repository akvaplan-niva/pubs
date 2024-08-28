export interface SlimPublication {
  published: Date;
  printed: Date;
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
