export interface DoiRegObject {
  doi: string;
  reg: string;
}

export interface Publication {
  id: string; // URI / universally unique
  published: Date | string;
  printed?: Date | string;
  type: string;
  container?: string;
  title: string;
  authors: Author[];
  doi?: string; // naked DOI, starting with 10.
  license?: string;
  pdf?: string;
  reg?: string;
}

export interface Author {
  family: string;
  given?: string;
  name?: string;
}
