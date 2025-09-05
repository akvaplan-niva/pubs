//export const clean = (s: string) => s;

// cleanJats (present in ~1/3 of Crossref works)
// bs$ ./kv/_list.ts crossref | nd-map d.value | grep '<jats:' | nd-map --select abstract | wc -l

const _uncleanedAbstract = // from: https://api.crossref.org/works/10.1111/jwas.13090
  `<jats:title>Abstract</jats:title><jats:p>Male postsmolt maturation (“jacking”) is undesired in Atlantic salmon aquaculture due to economic and welfare impacts.
Unfortunately, incidence of jacking has increased linked to intensive rearing conditions.
This study subjected 1000 salmon (52.1 ± 5.2 g) to one of two temperatures (15, 12.5°C) and one of two photoperiods (constant light‐LL, a 5‐week LD12:12 winter signal regime‐WS) to assess their effects on spermatogenesis regulation.
Indicators included testis histology images, mRNA transcription of gonadotropin receptors for follicle‐stimulating hormone (<jats:italic>fshr</jats:italic>) and luteinizing hormone (<jats:italic>lhr</jats:italic>), and of factors regulating spermatogenesis like anti‐Müllerian hormone (<jats:italic>amh</jats:italic>), gonadal‐soma‐derived factors 1 and 2 (<jats:italic>gsdf1</jats:italic> and <jats:italic>gsdf2</jats:italic>), and insulin‐like growth factor‐3 (<jats:italic>igf3</jats:italic>).
High temperature (15°C) induced early testis development processes irrespective of photoperiod, evidenced by presence of type B spermatogonia before clear increases in testis size or any transcriptional changes.
The winter signal at 15°C caused a synchronized onset of spermatogenesis not present under constant light.
This was evidenced by a pronounced downregulation of the spermatogenesis‐inhibiting factor <jats:italic>amh</jats:italic> and a clear upregulation in the stimulating factor <jats:italic>igf3</jats:italic>.
Consequently, combining high temperatures with winter signal regimes pose risk; high temperature can stimulate early cellular/endocrine processes of spermatogenesis, which can later be synchronized in the population by an increase in daylength.</jats:p>`;

const _cleaned =
  `Male postsmolt maturation (“jacking”) is undesired in Atlantic salmon aquaculture due to economic and welfare impacts.
  Unfortunately, incidence of jacking has increased linked to intensive rearing conditions.
  This study subjected 1000 salmon (52.1 ± 5.2 g) to one of two temperatures (15, 12.5°C) and one of two photoperiods (constant light‐LL, a 5‐week LD12:12 winter signal regime‐WS) to assess their effects on spermatogenesis regulation.
  Indicators included testis histology images, mRNA transcription of gonadotropin receptors for follicle‐stimulating hormone (fshr) and luteinizing hormone (lhr), and of factors regulating spermatogenesis like anti‐Müllerian hormone (amh), gonadal‐soma‐derived factors 1 and 2 (gsdf1 and gsdf2), and insulin‐like growth factor‐3 (igf3).
  High temperature (15°C) induced early testis development processes irrespective of photoperiod, evidenced by presence of type B spermatogonia before clear increases in testis size or any transcriptional changes.
  The winter signal at 15°C caused a synchronized onset of spermatogenesis not present under constant light.
  This was evidenced by a pronounced downregulation of the spermatogenesis‐inhibiting factor amh and a clear upregulation in the stimulating factor igf3.
  Consequently, combining high temperatures with winter signal regimes pose risk; high temperature can stimulate early cellular/endocrine processes of spermatogenesis, which can later be synchronized in the population by an increase in daylength.`;
