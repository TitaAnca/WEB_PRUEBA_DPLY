export type SeoContentSection = {
  title?: string;
  paragraphs: string[];
  list?: string[];
};

export type SeoFaqItem = {
  question: string;
  answer: string;
};

export type SeoRelatedLink = {
  href: string;
  label: string;
};

export type SeoInternalPageData = {
  path: string;
  metadataTitle: string;
  metadataDescription: string;
  h1: string;
  lead: string;
  sections: SeoContentSection[];
  processTitle?: string;
  processSteps?: string[];
  deliverablesTitle?: string;
  deliverables?: string[];
  audienceTitle?: string;
  audience?: string[];
  faqs: SeoFaqItem[];
  relatedLinks: SeoRelatedLink[];
  breadcrumbLabel: string;
  serviceType?: string;
  pageKind: "service" | "local";
};
