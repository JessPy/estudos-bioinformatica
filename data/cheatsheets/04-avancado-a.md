# Machine learning, Comunicação, Single-cell, Outras ômicas, HPC/nuvem, Multi-omics

@@ ML1:0
> **O que esperar:** por que modelos erram fora dos dados de treino e como particionar dados para medir isso honestamente. Base: ISLR caps. 2 e 5, docs do scikit-learn.

### Conceitos
- **Erro esperado = viés² + variância + ruído irredutível.** Modelo simples: viés alto (underfitting); complexo: variância alta (**overfitting**).
- **Regularização** reduz variância penalizando complexidade.
- **Treino / validação / teste:** ajustar no treino, escolher hiperparâmetros na validação (ou CV), reportar no **teste intocado**.
- **Validação cruzada k-fold** (5–10), estratificada para classes.
- **Curva de aprendizado:** erro × tamanho do treino. Treino bom e validação ruim = variância; ambos ruins = viés.
- Em biologia, p ≫ n: overfitting é a regra.

### Código
```python
from sklearn.model_selection import train_test_split, learning_curve, StratifiedKFold
X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=.2, stratify=y, random_state=0)
sizes, tr, va = learning_curve(model, X_tr, y_tr, cv=StratifiedKFold(5, shuffle=True, random_state=0),
                               train_sizes=np.linspace(.1, 1, 8), scoring="roc_auc")
```

### Armadilhas
- Olhar o teste várias vezes vira validação (otimismo).
- Amostras do mesmo paciente/lote em treino e teste → desempenho inflado.

@@ ML1:1
> **O que esperar:** regressão com penalização L2/L1 para dados de alta dimensão e seleção de genes. Base: ISLR cap. 6, scikit-learn linear models, glmnet.

### Conceitos
- **Ridge (L2):** penaliza Σβ²; encolhe coeficientes, mantém todos; lida com colinearidade.
- **Lasso (L1):** penaliza Σ|β|; zera coeficientes → **seleção de variáveis**; entre correlacionados escolhe um quase arbitrariamente.
- **Elastic net:** mistura (α/`l1_ratio`); seleciona grupos correlacionados.
- **λ** (força) escolhido por CV; `lambda.1se` = modelo mais simples dentro de 1 SE do mínimo.
- **Padronize** as features antes (penalidade depende da escala).
- **Estabilidade:** refazer em bootstraps e contar quantas vezes cada gene é escolhido (*stability selection*).

### Código
```python
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegressionCV
m = make_pipeline(StandardScaler(), LogisticRegressionCV(penalty="elasticnet", solver="saga",
                  l1_ratios=[.1, .5, .9], Cs=20, cv=5, scoring="roc_auc", max_iter=5000))
m.fit(X_tr, y_tr); coef = m[-1].coef_.ravel(); selected = np.flatnonzero(coef)
```
```r
library(glmnet); cv <- cv.glmnet(X, y, family = "binomial", alpha = 1); coef(cv, s = "lambda.1se")
```

### Armadilhas
- Genes selecionados pelo lasso não são “os” genes causais; mudam com pequenas perturbações.
- Escalonar com o conjunto inteiro antes do split = vazamento.

@@ ML1:2
> **O que esperar:** modelos baseados em árvores — árvores de decisão, random forest e gradient boosting — e seus hiperparâmetros. Base: ISLR cap. 8, docs scikit-learn/XGBoost/LightGBM.

### Conceitos
- **Árvore:** divisões que reduzem impureza (Gini/entropia; MSE em regressão); interpretável, alta variância.
- **Bagging:** muitas árvores em bootstraps, média → menos variância. **Random forest:** bagging + subconjunto aleatório de features por divisão (`max_features`); erro **OOB** como validação.
- **Boosting:** árvores rasas em sequência, cada uma corrige o resíduo da anterior (gradient boosting). **XGBoost/LightGBM/CatBoost**: regularização, rapidez, NaN nativo.
- Hiperparâmetros-chave: RF (`n_estimators`, `max_features`, `min_samples_leaf`); boosting (`learning_rate`, `n_estimators` com early stopping, `max_depth`/`num_leaves`, `subsample`, `colsample_bytree`).
- Não precisam de escalonamento; capturam interações e não linearidades.

### Código
```python
from sklearn.ensemble import RandomForestClassifier
rf = RandomForestClassifier(500, max_features="sqrt", min_samples_leaf=2, oob_score=True, n_jobs=-1, random_state=0).fit(X_tr, y_tr)
rf.oob_score_
import lightgbm as lgb
gbm = lgb.LGBMClassifier(learning_rate=.05, n_estimators=2000, num_leaves=15, subsample=.8, colsample_bytree=.5)
gbm.fit(X_tr, y_tr, eval_set=[(X_va, y_va)], callbacks=[lgb.early_stopping(100)])
```

### Armadilhas
- Importância por impureza (Gini) favorece features contínuas/com muitos níveis → use permutação/SHAP.
- Boosting overfita fácil sem early stopping.

@@ ML1:3
> **O que esperar:** modelos clássicos baseados em margem, vizinhança e probabilidade — SVM, kNN e naive Bayes. Base: ISLR caps. 4 e 9, scikit-learn.

### Conceitos
- **SVM:** hiperplano de **margem máxima**; vetores de suporte; `C` controla a tolerância a erros (C alto = margem estreita, risco de overfit).
- **Kernel trick:** RBF (`gamma` = alcance da influência), polinomial — fronteiras não lineares sem criar features explicitamente.
- **kNN:** classe pela maioria dos k vizinhos; sensível à escala e à **maldição da dimensionalidade** (em alta dimensão, todas as distâncias ficam parecidas).
- **Naive Bayes:** P(classe|x) supondo features independentes dado a classe; rápido, bom baseline (texto, k-mers).
- Escalonar features é obrigatório para SVM e kNN.

### Código
```python
from sklearn.svm import SVC
from sklearn.model_selection import GridSearchCV
pipe = make_pipeline(StandardScaler(), SVC(kernel="rbf", probability=True))
grid = GridSearchCV(pipe, {"svc__C": np.logspace(-2, 3, 6), "svc__gamma": np.logspace(-4, 0, 5)}, cv=5, scoring="roc_auc")
grid.fit(X_tr, y_tr); grid.best_params_
from sklearn.neighbors import KNeighborsClassifier; from sklearn.naive_bayes import GaussianNB
```

### Armadilhas
- `probability=True` no SVC usa calibração interna (Platt) — lenta e às vezes inconsistente com `predict`.
- kNN com milhares de genes sem redução de dimensionalidade funciona mal.

@@ ML1:4
> **O que esperar:** encontrar estrutura sem rótulos e visualizar dados de alta dimensão — e o que **não** concluir de UMAP/t-SNE. Base: ISLR cap. 12, docs UMAP/openTSNE, Chari & Pachter 2023.

### Conceitos
- **PCA:** linear, preserva variância global, eixos interpretáveis (loadings). Ponto de partida.
- **t-SNE:** preserva vizinhanças locais; `perplexity` (~5–50); distâncias entre clusters e tamanhos de clusters **não têm significado**.
- **UMAP:** grafo de vizinhança + otimização; `n_neighbors` (local × global), `min_dist`; mais rápido, “parece” preservar estrutura global, mas também distorce.
- Use UMAP/t-SNE para **visualizar**; faça clustering e análises em PCA/espaço original.
- Clustering: k-means, hierárquico, DBSCAN/HDBSCAN (densidade), **Leiden/Louvain** em grafos kNN.

### Código
```python
from sklearn.decomposition import PCA
from sklearn.manifold import TSNE
import umap
Z = PCA(50).fit_transform(StandardScaler().fit_transform(X))
t = TSNE(perplexity=30, init="pca", random_state=0).fit_transform(Z)
u = umap.UMAP(n_neighbors=15, min_dist=.3, random_state=0).fit_transform(Z)
```

### Armadilhas
- “Esses dois clusters estão longe no UMAP, então são muito diferentes” — falso.
- Rodar uma única semente/parâmetro e tirar conclusões.

@@ ML1:5
> **O que esperar:** a parte que mais separa júnior de sênior em ML — validação sem vazamento, CV aninhada, classes desbalanceadas e métricas certas. Base: Kapoor & Narayanan (leakage), docs scikit-learn (Pipeline, nested CV, metrics), Chicco & Jurman (MCC).

### Conceitos
- **Vazamento:** qualquer informação do teste no treino — seleção de features, normalização, imputação ou batch correction **antes** do split; amostras relacionadas (mesmo paciente) separadas entre folds; dados do futuro.
- Solução: **Pipeline** (todo pré-processamento dentro da CV) + **GroupKFold** para dependências.
- **CV aninhada:** laço interno escolhe hiperparâmetros, laço externo estima desempenho.
- **Desbalanceamento:** estratificar; `class_weight="balanced"`; avaliar por AUPRC/MCC; reamostragem só dentro do treino.
- **Métricas:** AUROC (ranqueamento; otimista em classes raras), **AUPRC** (foco na positiva rara; baseline = prevalência), **MCC** (usa as 4 células da matriz), sensibilidade/especificidade no limiar, **calibração** (probabilidades confiáveis; Brier, curva de calibração).

### Código
```python
from sklearn.pipeline import Pipeline
from sklearn.feature_selection import SelectKBest, f_classif
from sklearn.model_selection import GridSearchCV, cross_val_score, GroupKFold, StratifiedKFold
pipe = Pipeline([("sc", StandardScaler()), ("sel", SelectKBest(f_classif)), ("clf", LogisticRegression(max_iter=5000))])
inner = GridSearchCV(pipe, {"sel__k": [50, 200, 1000], "clf__C": [.01, .1, 1]}, cv=StratifiedKFold(5), scoring="average_precision")
outer = cross_val_score(inner, X, y, cv=GroupKFold(5), groups=paciente, scoring="average_precision")
from sklearn.metrics import roc_auc_score, average_precision_score, matthews_corrcoef
from sklearn.calibration import CalibrationDisplay
```

### Armadilhas
- Selecionar os 100 genes mais diferentes no dataset inteiro e depois fazer CV → AUC alto até com rótulos aleatórios.
- Acurácia de 95% com 95% de negativos = modelo inútil.

@@ ML1:6
> **O que esperar:** explicar modelos — importância global e explicações locais — sem confundir explicação com causalidade. Base: Molnar “Interpretable Machine Learning”, docs SHAP, scikit-learn permutation importance.

### Conceitos
- **Global:** quais features importam no geral. **Local:** por que **esta** amostra recebeu esta predição.
- **Importância por permutação:** queda de desempenho ao embaralhar uma feature (no conjunto de validação/teste).
- **SHAP:** valores de Shapley — contribuição de cada feature para a predição relativa à média; soma = predição − base. `TreeExplainer` exato e rápido para árvores.
- Gráficos: beeswarm/summary (global), waterfall/force (local), dependence (efeito × valor).
- **Armadilhas:** features correlacionadas dividem/roubam importância; explicações descrevem o **modelo**, não a biologia; modelo ruim gera explicação sem valor.

### Código
```python
from sklearn.inspection import permutation_importance
pi = permutation_importance(model, X_te, y_te, n_repeats=20, scoring="roc_auc", random_state=0)
import shap
ex = shap.TreeExplainer(gbm); sv = ex(X_te)
shap.plots.beeswarm(sv); shap.plots.waterfall(sv[0])
```

### Armadilhas
- Interpretar SHAP de um modelo com vazamento.
- “Gene X tem SHAP alto, portanto causa a doença.”

@@ ML1:7
> **O que esperar:** rastrear experimentos de ML e versionar dados/modelos para reproduzir qualquer resultado. Base: docs MLflow (tracking, models), DVC.

### Conceitos
- **Rastreamento:** cada execução registra parâmetros, métricas, artefatos (figuras, modelo), versão do código (commit) e do dado.
- **MLflow:** `Tracking` (runs/experimentos, UI), `Models` (formato padrão), `Model Registry` (estágios/versões), autologging.
- **Versionamento de dados:** **DVC** (ponteiros no Git, dados no storage remoto), hashes/manifests; datasets imutáveis com ID.
- Reprodutibilidade de modelo = código + dados + ambiente + sementes + hiperparâmetros.

### Código
```python
import mlflow
mlflow.set_experiment("pred-fenotipo")
with mlflow.start_run(run_name="lgbm-v1"):
    mlflow.log_params(params); gbm.fit(X_tr, y_tr)
    mlflow.log_metric("auprc_val", average_precision_score(y_va, gbm.predict_proba(X_va)[:, 1]))
    mlflow.sklearn.log_model(gbm, "model"); mlflow.log_artifact("shap.png")
```
```bash
mlflow ui
dvc init && dvc add data/expr.parquet && git add data/expr.parquet.dvc && dvc push
```

### Armadilhas
- Registrar só a melhor execução (esconde quantas tentativas foram feitas).

@@ COM:0
> **O que esperar:** escrever textos científicos claros, com estrutura e narrativa. Base: Mensh & Kording 2017 (Ten simple rules for structuring papers), guias de escrita científica.

### Conceitos
- **Uma mensagem central** por artigo/relatório; tudo serve a ela.
- **Contexto → conteúdo → conclusão** em cada nível (documento, seção, parágrafo).
- **Parágrafo = uma ideia**, com frase-tópico no início.
- Resumo: contexto, lacuna, o que foi feito, resultado principal (com número), implicação.
- Estrutura IMRaD: Introdução (por quê), Métodos (como, reprodutível), Resultados (o quê, sem interpretar demais), Discussão (significado, limitações).
- Frases curtas, voz ativa, termos consistentes (não alterne sinônimos para o mesmo conceito).

### Checklist
- [ ] O leitor sabe em 1 frase qual é o achado?
- [ ] Cada figura tem uma mensagem e é citada no texto?
- [ ] Limitações explícitas?
- [ ] Números com unidade, n e incerteza?

@@ COM:1
> **O que esperar:** figuras que comunicam uma mensagem — escolha do gráfico, cor, hierarquia visual e acessibilidade. Base: Wilke “Fundamentals of Data Visualization”, Rougier et al. 2014 (Ten simple rules for better figures).

### Conceitos
- Comece pela **mensagem**; escolha o gráfico que a torna óbvia; remova o que não ajuda (*data-ink*).
- **Hierarquia:** destaque o que importa (cor/realce), deixe o contexto em cinza.
- **Cor:** sequencial (magnitude), divergente (desvio de um centro), qualitativa (categorias, ≤ 7–8); seguras para daltonismo (viridis, Okabe-Ito); nunca só cor para codificar — use também forma/rótulo.
- Rotule diretamente em vez de legendas distantes; fontes legíveis no tamanho final.
- Mostre dados (pontos) além de resumos; eixos com unidades.
- **Graphical abstract:** pergunta → abordagem → achado em um fluxo visual.

### Código
```python
import matplotlib as mpl
okabe = ["#E69F00", "#56B4E9", "#009E73", "#F0E442", "#0072B2", "#D55E00", "#CC79A7", "#000000"]
mpl.rcParams.update({"axes.prop_cycle": mpl.cycler(color=okabe), "axes.spines.top": False, "axes.spines.right": False, "font.size": 9})
```

### Armadilhas
- Pizza 3D, eixo duplo, arco-íris, barras com média de 3 pontos.

@@ COM:2
> **O que esperar:** apresentar trabalho em falas, posters e para públicos não técnicos. Base: guias de apresentação científica (Ten simple rules for making good oral presentations / posters).

### Conceitos
- **Mensagem central em 1 frase**; o público deve lembrar dela amanhã.
- **Roteiro:** problema (por que importa) → o que fizemos → o achado principal → o que significa → próximo passo.
- **Tempo:** ~1 slide/min; ensaie cronometrado; corte detalhes de método.
- **Slides:** 1 ideia por slide, título que afirma a conclusão (“X dobra após Y”), pouco texto, figuras grandes.
- **Poster:** legível a 2 m; título-conclusão; fluxo em colunas; QR code para o repositório.
- **Público leigo:** analogias, sem jargão, números concretos, foco no impacto.

### Pitch de 3 min (modelo)
1. Gancho (15 s): um problema concreto.
2. O que fiz (60 s): pergunta + abordagem em linguagem simples.
3. O que descobri (60 s): 1 resultado com 1 número.
4. Por que importa (30 s) + chamada para ação (15 s).

@@ COM:3
> **O que esperar:** trabalhar bem com laboratório, clínica e negócio — expectativas, acordos de dados e consultoria estatística. Base: guias de colaboração (ten simple rules for collaborative research / statistical consulting).

### Conceitos
- **Entrar cedo:** bioinformata no desenho do experimento evita dados inanalisáveis.
- **Alinhar:** pergunta, entregáveis, prazos, critérios de sucesso, quem decide.
- **Acordo de análise:** objetivo, dados (origem, formato, metadados, consentimento), métodos previstos, o que é exploratório, autoria/créditos, propriedade e compartilhamento, cronograma, comunicação.
- **Traduzir:** perguntas do lab/negócio em hipóteses testáveis; resultados em decisões.
- Comunicar incerteza e limitações sem jargão; registrar decisões por escrito.

### Modelo curto de acordo
- Pergunta principal / secundárias
- Dados e metadados que o lab entrega (prazo, formato)
- Análises incluídas e fora do escopo
- Entregáveis (relatório, figuras, código) e datas
- Autoria e agradecimentos
- Dados sensíveis: base legal, acesso, retenção

@@ COM:4
> **O que esperar:** revisar código e dar feedback útil, e escrever documentos técnicos (design docs) que ajudam decisões. Base: Google Engineering Practices (code review), guias de design docs.

### Conceitos
- **Code review busca:** corretude, design, testes, legibilidade, nomes, documentação — não preferências de estilo (o linter cuida).
- **Comentários acionáveis e gentis:** explique o porquê, sugira alternativa, diferencie bloqueante de “nit:”, faça perguntas (“O que acontece se o arquivo estiver vazio?”), elogie o que está bom.
- Revisões pequenas e rápidas; o autor contextualiza o PR (o que, por quê, como testar).
- **Design doc:** contexto e problema, objetivos e **não objetivos**, proposta, alternativas consideradas, trade-offs, riscos, plano de rollout, perguntas abertas.

### Exemplos de comentário
- “nit: `n` → `n_reads` deixa claro na linha 40.”
- “Bloqueante: se `samples.tsv` tiver cabeçalho, o loop conta a 1ª linha como amostra. Sugiro `tail -n +2` ou checar o nome da coluna.”
- “Pergunta: por que não usar `pysam` aqui? Evitaria parsear SAM à mão.”

@@ SC:0
> **O que esperar:** as tecnologias de single-cell e como o desenho experimental muda em relação ao bulk. Base: revisões de métodos single-cell (Heumos et al. 2023 “Best practices”).

### Conceitos
- **Gotas (10x Chromium):** milhares de células, 3' ou 5', **barcode celular + UMI** (conta moléculas, remove duplicatas de PCR); baixa profundidade por célula.
- **Placas (Smart-seq2/3):** centenas de células, transcrito completo (isoformas, SNVs), mais genes por célula.
- **snRNA-seq:** núcleos (tecidos congelados, neurônios); mais reads intrônicas.
- **Multiome:** RNA + ATAC na mesma célula; **CITE-seq:** RNA + proteínas de superfície (anticorpos com barcode).
- **Cell hashing/multiplexação:** várias amostras num canal (anticorpos HTO ou genótipo — demuxlet/souporcell) → reduz custo e lote, identifica doublets entre amostras.
- **Desenho:** a réplica é a **amostra/doador**, não a célula; balancear condições entre canais/lotes.

### Armadilhas
- Dissociação enzimática induz genes de estresse e perde tipos frágeis.
- Comparar condições com 1 doador por condição (n = 1, ainda que com 10 mil células).

@@ SC:1
> **O que esperar:** limpar dados single-cell — métricas de QC, doublets e RNA ambiente. Base: Heumos et al. 2023 (sc-best-practices), docs scanpy, scDblFinder, SoupX, CellBender.

### Conceitos
- Métricas por célula: **nº de UMIs** (total_counts), **nº de genes** (n_genes_by_counts), **% mitocondrial** (célula danificada), % ribossomal/hemoglobina.
- Filtros por **MAD** por amostra (ex.: > 5 MADs) são mais robustos que limiares fixos; dependem do tecido.
- **Doublets:** duas células numa gota → perfis mistos; Scrublet, **scDblFinder** (simulam doublets artificiais).
- **RNA ambiente:** mRNA livre na suspensão contamina todas as gotas → **SoupX**, **CellBender** (também chama células).
- Emptydrops/CellRanger distinguem gotas vazias de células.

### Código
```python
import scanpy as sc
adata = sc.datasets.pbmc3k()
adata.var["mt"] = adata.var_names.str.startswith("MT-")
sc.pp.calculate_qc_metrics(adata, qc_vars=["mt"], inplace=True, log1p=True)
sc.pl.violin(adata, ["n_genes_by_counts", "total_counts", "pct_counts_mt"], multi_panel=True)
adata = adata[(adata.obs.pct_counts_mt < 10) & (adata.obs.n_genes_by_counts > 200)].copy()
sc.pp.scrublet(adata); adata = adata[~adata.obs.predicted_doublet].copy()
```

### Armadilhas
- Filtrar % mito igual para todos os tecidos (cardiomiócitos e hepatócitos têm alto mito natural).
- Remover doublets depois do clustering “porque apareceu um cluster estranho” sem checar.

@@ SC:2
> **O que esperar:** o fluxo padrão do single-cell — normalização, genes variáveis, PCA, grafo de vizinhos, clustering e UMAP — e as decisões de parâmetro. Base: tutorial de clustering do scanpy, Seurat PBMC3k.

### Conceitos
- **Normalização:** total por célula (ex.: 10⁴) + log1p; alternativas: SCTransform (Seurat), Pearson residuals, scran (pool-based).
- **HVGs:** 2 000–3 000 genes mais variáveis (corrigindo pela média).
- **PCA** (escolha nº de PCs pelo *elbow*, ~20–50) → **grafo kNN** (`n_neighbors` ~15) → **Leiden/Louvain** (`resolution` ↑ = mais clusters) → **UMAP** para visualizar.
- Clusters ≠ tipos celulares; teste várias resoluções e avalie estabilidade/marcadores.
- Mantenha as contagens brutas em `adata.layers["counts"]`/`adata.raw`.

### Código
```python
adata.layers["counts"] = adata.X.copy()
sc.pp.normalize_total(adata, target_sum=1e4); sc.pp.log1p(adata)
sc.pp.highly_variable_genes(adata, n_top_genes=2000, flavor="seurat_v3", layer="counts")
sc.tl.pca(adata, n_comps=50); sc.pl.pca_variance_ratio(adata, log=True)
sc.pp.neighbors(adata, n_neighbors=15, n_pcs=30); sc.tl.umap(adata)
for r in [0.3, 0.6, 1.0]: sc.tl.leiden(adata, resolution=r, key_added=f"leiden_{r}")
sc.pl.umap(adata, color=["leiden_0.6", "CD3E", "MS4A1", "LYZ"])
```
```r
pbmc <- NormalizeData(pbmc) |> FindVariableFeatures() |> ScaleData() |> RunPCA() |>
  FindNeighbors(dims = 1:10) |> FindClusters(resolution = 0.5) |> RunUMAP(dims = 1:10)
```

### Armadilhas
- Escolher a resolução que “dá os clusters esperados” (viés de confirmação).
- Interpretar distâncias do UMAP (ver ML1:4).

@@ SC:3
> **O que esperar:** dar nome biológico aos clusters — por marcadores e por métodos automáticos com referência. Base: docs CellTypist, Azimuth, scanpy/Seurat (marcadores).

### Conceitos
- **Manual:** genes marcadores por cluster (`rank_genes_groups`/`FindAllMarkers`) + conhecimento (PBMC: T `CD3E`, CD4 `IL7R`, CD8 `CD8A`, B `MS4A1`, NK `GNLY/NKG7`, monócitos CD14 `LYZ/CD14`, FCGR3A+ `FCGR3A`, DC `FCER1A`, plaquetas `PPBP`).
- **Automático:** **CellTypist** (modelos logísticos treinados em atlas), **Azimuth/Seurat label transfer** (mapeia para referência), SingleR (correlação). Use *majority voting* por cluster.
- Avalie a confiança, compare manual × automático; células “desconhecidas” podem ser novas ou artefato.
- Use ontologia (Cell Ontology) para nomes consistentes.

### Código
```python
sc.tl.rank_genes_groups(adata, "leiden_0.6", method="wilcoxon"); sc.pl.rank_genes_groups_dotplot(adata, n_genes=4)
import celltypist
pred = celltypist.annotate(adata, model="Immune_All_Low.pkl", majority_voting=True)
adata = pred.to_adata(); sc.pl.umap(adata, color="majority_voting")
```

### Armadilhas
- Referência de outro tecido/espécie/protocolo força rótulos errados.
- Marcadores de cluster por teste por célula têm p-valores minúsculos (n = células) — use para ranquear, não como inferência.

@@ SC:4
> **O que esperar:** juntar dados de lotes/estudos diferentes removendo efeito técnico sem apagar biologia. Base: Luecken et al. 2022 (scIB benchmark), docs Harmony e scvi-tools.

### Conceitos
- **Harmony:** corrige o espaço de PCA iterativamente (rápido, linear). **scVI:** VAE com lote como covariável → espaço latente integrado; **scANVI** usa rótulos parciais. Outros: Seurat CCA/RPCA, BBKNN, Scanorama.
- **Métricas scIB:** remoção de lote (iLISI, kBET, ASW de lote) × conservação biológica (cLISI, ARI/NMI, ASW de tipo celular). Equilíbrio entre os dois.
- **Sobrecorreção:** tipos celulares específicos de uma condição são “misturados” e somem.
- Integração serve para **clustering/anotação**; para DE use contagens originais com lote no modelo.

### Código
```python
import scanpy.external as sce
sce.pp.harmony_integrate(adata, key="batch"); sc.pp.neighbors(adata, use_rep="X_pca_harmony")
import scvi
scvi.model.SCVI.setup_anndata(adata, layer="counts", batch_key="batch")
m = scvi.model.SCVI(adata, n_latent=30); m.train()
adata.obsm["X_scVI"] = m.get_latent_representation(); sc.pp.neighbors(adata, use_rep="X_scVI")
```

### Armadilhas
- Usar a condição biológica como `batch_key`.
- Avaliar integração só visualmente no UMAP.

@@ SC:5
> **O que esperar:** inferir processos dinâmicos (diferenciação), velocidade de RNA e comunicação entre células — e seus limites. Base: docs scVelo/CellRank, PAGA, Slingshot, CellChat/LIANA.

### Conceitos
- **Pseudotempo:** ordena células num contínuo (diffusion pseudotime, Slingshot, Monocle3, PAGA para topologia). Precisa de célula raiz e supõe processo contínuo amostrado.
- **RNA velocity:** razão RNA não processado/processado indica se o gene está sendo ativado ou desligado → direção futura (scVelo; modelos dinâmicos). **CellRank** combina velocity e similaridade para destinos.
- **Limitações de velocity:** supõe cinética constante; ruim com poucos genes dinâmicos, snRNA, ou quando a taxa muda; setas bonitas ≠ validação.
- **Comunicação célula-célula:** coexpressão ligante (célula A) – receptor (célula B) em bancos (CellPhoneDB, CellChat, **LIANA** agrega métodos). Gera hipóteses, não prova sinalização.

### Código
```python
sc.tl.diffmap(adata); adata.uns["iroot"] = np.flatnonzero(adata.obs["tipo"] == "HSC")[0]; sc.tl.dpt(adata)
sc.tl.paga(adata, groups="tipo"); sc.pl.paga(adata)
import scvelo as scv
scv.pp.moments(adata); scv.tl.velocity(adata, mode="stochastic"); scv.tl.velocity_graph(adata)
scv.pl.velocity_embedding_stream(adata, basis="umap")
import liana as li; li.mt.rank_aggregate(adata, groupby="tipo", use_raw=False)
```

### Armadilhas
- Trajetória inferida em dados que não contêm um processo contínuo (ex.: tipos terminais distintos).

@@ SC:6
> **O que esperar:** expressão diferencial entre condições do jeito certo (pseudobulk) e análise de transcriptômica espacial. Base: Squair et al. 2021, docs decoupler/edgeR, Squidpy.

### Conceitos
- **Pseudobulk:** somar contagens por **amostra × tipo celular** → DESeq2/edgeR/limma com réplicas biológicas. Testes por célula tratam células como réplicas → falsos positivos massivos (Squair et al. 2021).
- **Espacial:** **Visium** (spots de 55 µm, vários células por spot → deconvolução: cell2location, RCTD), **Visium HD/Xenium/MERFISH/CosMx** (resolução subcelular, painel de genes).
- **Autocorrelação espacial:** **Moran's I** (genes com padrão espacial), vizinhança espacial, enriquecimento de vizinhos (co-localização), domínios espaciais.
- Dados espaciais também têm efeitos de lote (lâmina, seção).

### Código
```python
import decoupler as dc
pb = dc.get_pseudobulk(adata, sample_col="donor", groups_col="cell_type", layer="counts", min_cells=10, min_counts=1000)
# → DESeq2 (pydeseq2) por tipo celular com design ~ condition
import squidpy as sq
ad = sq.datasets.visium_hne_adata()
sq.gr.spatial_neighbors(ad); sq.gr.spatial_autocorr(ad, mode="moran"); ad.uns["moranI"].head()
sq.gr.nhood_enrichment(ad, cluster_key="cluster"); sq.pl.spatial_scatter(ad, color="cluster")
```

### Armadilhas
- Pseudobulk com um doador por condição continua sem réplica.
- Interpretar spot do Visium como uma célula.

@@ OMX:0
> **O que esperar:** como a proteômica por espectrometria de massas identifica e quantifica proteínas (DDA, DIA, TMT). Base: revisões de proteômica bottom-up, PRIDE.

### Conceitos
- **Bottom-up:** proteínas digeridas (tripsina, corta após K/R) → peptídeos → LC → **ionização** (ESI) → MS1 (massa/carga do precursor) → fragmentação → MS2 (espectro de fragmentos b/y).
- **Identificação:** comparar espectros observados com teóricos de um banco (MaxQuant/Andromeda, MSFragger, Comet) → **PSMs** → peptídeos → proteínas (inferência; problema de peptídeos compartilhados).
- **FDR target-decoy:** banco reverso/embaralhado estima falsos; controle 1% no nível de PSM, peptídeo e proteína.
- **Quantificação:** **label-free** (intensidade MS1/LFQ; spectral counting), **TMT/iTRAQ** (marcação isobárica, multiplex 16–18 amostras; compressão de razão), SILAC.
- **DDA** (seleciona os top N precursores — estocástico, mais ausentes) × **DIA** (fragmenta janelas fixas — reprodutível; DIA-NN, Spectronaut).

### Armadilhas
- Proteínas identificadas por um único peptídeo são pouco confiáveis.
- PRIDE: confira instrumento, enzima, modificações e software nos metadados antes de reanalisar.

@@ OMX:1
> **O que esperar:** análise estatística de tabelas de proteínas — ausentes, normalização, imputação e testes moderados. Base: limma, DEP/MSstats, literatura sobre MNAR em proteômica.

### Conceitos
- **Ausentes:** MNAR (abaixo do limite de detecção — proteína pouco abundante) × MAR/MCAR (aleatórios, DDA). O padrão importa para a imputação.
- **Pré-processamento:** log2 das intensidades, filtro por proporção de valores válidos (ex.: ≥ 70% em um grupo), normalização (mediana, quantis, VSN).
- **Imputação:** MNAR → valores baixos (MinProb, distribuição deslocada); MAR → kNN/BPCA/random forest. Sempre faça análise de sensibilidade.
- **Teste:** limma (moderação empírica de Bayes) por proteína; MSstats modela no nível de peptídeo/feature.
- Volcano: log2FC × −log10(p), com FDR.

### Código
```r
library(limma)
X <- log2(intens); X <- X[rowMeans(!is.na(X[, grpA])) >= .7 | rowMeans(!is.na(X[, grpB])) >= .7, ]
X <- normalizeBetweenArrays(X, method = "quantile")
imp_mnar <- function(v) { m <- mean(v, na.rm = TRUE) - 1.8 * sd(v, na.rm = TRUE); v[is.na(v)] <- rnorm(sum(is.na(v)), m, .3 * sd(v, na.rm = TRUE)); v }
Xi <- apply(X, 2, imp_mnar)
fit <- eBayes(lmFit(Xi, model.matrix(~ grupo))); topTable(fit, coef = 2, number = Inf)
```

### Armadilhas
- Imputar e tratar valores imputados como medidos (variância subestimada).
- Proteína “presente/ausente” entre grupos pode ser só limite de detecção.

@@ OMX:2
> **O que esperar:** o fluxo de metabolômica — aquisição (LC-MS/GC-MS), processamento, anotação e normalização. Base: tutoriais do MetaboAnalyst, Metabolomics Standards Initiative.

### Conceitos
- **Plataformas:** LC-MS (amplo, polares/apolares conforme coluna), GC-MS (voláteis/derivatizados, bibliotecas de EI robustas), RMN (quantitativo, menos sensível).
- **Targeted** (painel conhecido, absoluto) × **untargeted** (perfil amplo, relativo, anotação difícil).
- **Processamento:** detecção de picos, alinhamento de tempo de retenção, agrupamento de adutos/isótopos (XCMS, MS-DIAL, MZmine).
- **Anotação (níveis MSI):** 1 confirmado com padrão; 2 provável (espectro de biblioteca); 3 classe química; 4 desconhecido. Bancos: HMDB, GNPS, MassBank.
- **QC:** amostras de QC pooled intercaladas para corrigir deriva; brancos.
- **Normalização:** por peso/volume, soma total, PQN; log + autoscaling/Pareto; análise multivariada (PCA, PLS-DA — validar com permutação!) e univariada com FDR.

### Armadilhas
- PLS-DA separa grupos até com dados aleatórios → valide (Q², permutação).
- Atribuir identidade a um pico só pela massa exata.

@@ OMX:3
> **O que esperar:** analisar epigenoma — ChIP-seq, ATAC-seq e metilação de DNA. Base: diretrizes ENCODE, nf-core/atacseq e chipseq, docs MACS2/DiffBind, Bismark.

### Conceitos
- **ChIP-seq:** imunoprecipitação de proteína ligada ao DNA + controle (input/IgG). Picos estreitos (TFs) × largos (H3K27me3, H3K36me3).
- **ATAC-seq:** Tn5 insere adaptadores em cromatina aberta; QC: tamanhos de fragmento (periodicidade nucleossomal), **TSS enrichment**, % mitocondrial; deslocar reads +4/−5.
- **Peak calling:** **MACS2/3** (modelo de Poisson local); **FRiP** (fração de reads em picos; ENCODE ≥ 1% TF, ATAC ≥ 20%); **IDR** para consistência entre réplicas; blacklist ENCODE.
- **Diferencial:** DiffBind/csaw (contagens em picos consenso + DESeq2/edgeR).
- **Metilação:** bisulfito converte C não metilado em U (lido como T) → **Bismark** (alinhamento), β = metilados/(metilados+não); **DMRs** com DSS, methylKit, dmrseq; arrays EPIC (minfi); long reads detectam 5mC direto.

### Comandos
```bash
macs3 callpeak -t chip.bam -c input.bam -f BAMPE -g hs -n S1 -q 0.01 --outdir peaks/
nextflow run nf-core/atacseq -profile test,docker --outdir atac_test
bismark --genome bismark_idx -1 R1.fq.gz -2 R2.fq.gz && bismark_methylation_extractor --bedGraph *.bam
```

### Armadilhas
- Picos sem controle/input ou sem remover a blacklist.
- Comparar FRiP entre protocolos diferentes.

@@ OMX:4
> **O que esperar:** usar estruturas experimentais (PDB) e preditas (AlphaFold) e saber ler a confiança dos modelos. Base: docs AlphaFold DB (pLDDT, PAE), RCSB PDB.

### Conceitos
- **PDB:** estruturas experimentais (raio-X: resolução Å; crio-EM; RMN); formato mmCIF/PDB; cadeias, resíduos, ligantes.
- **AlphaFold 2/3:** predição a partir de sequência (+ MSA). **pLDDT** (0–100, por resíduo): > 90 muito alta, 70–90 boa, 50–70 baixa, < 50 provavelmente desordenada. **PAE** (erro alinhado previsto, em Å): confiança na posição **relativa** de domínios/cadeias.
- **Limitações:** um único estado conformacional; ligantes/PTMs/complexos limitados (AF3 melhora); regiões desordenadas; efeito de mutação pontual não é previsto de forma confiável pela estrutura.
- Mapear variantes: posição no núcleo hidrofóbico, sítio ativo, interface; combinar com AlphaMissense, conservação.

### Código
```python
import requests
u = "https://alphafold.ebi.ac.uk/api/prediction/P04637"; m = requests.get(u).json()[0]
pdb = requests.get(m["pdbUrl"]).text          # pLDDT fica na coluna B-factor
from Bio.PDB import PDBParser
import io; s = PDBParser(QUIET=True).get_structure("tp53", io.StringIO(pdb))
plddt = {r.id[1]: r["CA"].get_bfactor() for r in s.get_residues() if "CA" in r}
```
- Visualização: PyMOL, ChimeraX, Mol* (colorir por pLDDT).

### Armadilhas
- Tratar regiões de pLDDT < 50 como estrutura real.
- Ignorar o PAE ao interpretar a orientação entre domínios.

@@ HPC:0
> **O que esperar:** usar um cluster HPC — nós, partições, recursos e submissão de jobs (incl. arrays) no Slurm. Base: HPC Carpentry, documentação do Slurm.

### Conceitos
- **Nó de login** (editar, submeter — não rodar análises pesadas) × **nós de computação**. **Partições/filas** com limites de tempo e recursos.
- Peça recursos realistas: `--cpus-per-task`, `--mem`, `--time`; o *scheduler* (fairshare, backfill) prioriza jobs pequenos/curtos.
- **Job array:** a mesma tarefa para N amostras (`$SLURM_ARRAY_TASK_ID`).
- Sistema de arquivos: `$HOME` (pequeno, backup), `/scratch` (rápido, temporário, sem backup); módulos de software (`module load`).

### Comandos
```bash
#!/bin/bash
#SBATCH --job-name=bwa
#SBATCH --partition=short
#SBATCH --cpus-per-task=8
#SBATCH --mem=16G
#SBATCH --time=04:00:00
#SBATCH --array=1-24%6
#SBATCH --output=logs/%x_%A_%a.out
set -euo pipefail
s=$(sed -n "${SLURM_ARRAY_TASK_ID}p" samples.txt)
bwa mem -t $SLURM_CPUS_PER_TASK ref.fa ${s}_R1.fq.gz ${s}_R2.fq.gz | samtools sort -o ${s}.bam
```
```bash
sbatch job.sh; squeue -u $USER; scancel JOBID; sacct -j JOBID --format=JobID,Elapsed,MaxRSS,State
srun --pty -c 4 --mem 8G -t 1:00:00 bash     # sessão interativa
```

### Armadilhas
- Pedir muito mais memória/tempo que o necessário → fila longa; use `sacct`/`seff` para calibrar.
- Milhares de arquivos pequenos sobrecarregam o sistema de arquivos paralelo.

@@ HPC:1
> **O que esperar:** conceitos de nuvem para bioinformática — modelos de serviço, armazenamento de objetos, custos e segurança (IAM). Base: docs AWS/GCP (S3/GCS, IAM, budgets).

### Conceitos
- **IaaS** (VMs: EC2/Compute Engine), **PaaS** (Batch, serviços gerenciados), **SaaS**. Regiões/zonas (latência, custo, residência de dados — LGPD).
- **Armazenamento de objetos** (S3/GCS): buckets, objetos imutáveis, sem diretórios reais; **classes** (Standard, Infrequent Access, Archive/Glacier) e **lifecycle rules**; **egress** (saída de dados) custa.
- **Custos:** computação por segundo; **spot/preemptible** até ~70–90% mais barato (pode ser interrompido); armazenamento por GB-mês; alertas de **orçamento**.
- **IAM:** usuários, papéis (roles), políticas; **privilégio mínimo**; nunca chaves no código; MFA; criptografia em repouso/trânsito; logs de acesso.

### Comandos
```bash
aws s3 mb s3://meu-lab-dados --region sa-east-1
aws s3 cp results/ s3://meu-lab-dados/run1/ --recursive
aws s3api put-public-access-block --bucket meu-lab-dados --public-access-block-configuration BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true
gcloud storage cp -r results gs://meu-lab-dados/
```

### Armadilhas
- Bucket público com dados genômicos (incidente comum).
- VM esquecida ligada e egress inesperado → configure alertas antes de começar.

@@ HPC:2
> **O que esperar:** rodar Nextflow na nuvem — executores, work dir em bucket, spot e Seqera Platform. Base: docs Nextflow (AWS Batch, Google Batch), Seqera Platform.

### Conceitos
- **Executor** define onde as tarefas rodam (`local`, `slurm`, `awsbatch`, `google-batch`, `k8s`).
- **Work dir no bucket** (`-w s3://bucket/work`): entradas/saídas intermediárias ficam no storage de objetos; cada processo precisa de container.
- **AWS Batch:** fila de jobs + compute environment (on-demand/spot); **Google Batch** similar, mais simples de configurar.
- **Spot:** `maxRetries` e `errorStrategy 'retry'` para interrupções.
- **Wave/Fusion** (Seqera): containers sob demanda e sistema de arquivos sobre S3 (menos cópias).
- **Seqera Platform:** UI para lançar, monitorar, custos por tarefa, compute environments.

### Código
```groovy
// nextflow.config
profiles {
  awsbatch {
    process.executor = 'awsbatch'
    process.queue = 'spot-queue'
    process.errorStrategy = { task.exitStatus in [137, 143] ? 'retry' : 'terminate' }
    process.maxRetries = 3
    aws.region = 'sa-east-1'
    workDir = 's3://meu-lab-dados/work'
  }
}
```
```bash
nextflow run main.nf -profile awsbatch,docker --outdir s3://meu-lab-dados/results -resume
```

### Armadilhas
- Work dir acumulando TB no bucket → limpe (`nextflow clean`) e use lifecycle.
- Recursos não declarados por processo → instâncias erradas e caras.

@@ HPC:3
> **O que esperar:** quando usar plataformas genômicas gerenciadas (Terra, DNAnexus, AWS HealthOmics) em vez de infraestrutura própria. Base: documentação das plataformas.

### Conceitos
- **Terra** (Broad/Google): workspaces com dados + WDL (Cromwell) + notebooks; ecossistema AnVIL, dados controlados (dbGaP).
- **DNAnexus:** forte em clínico/regulado (UK Biobank RAP), apps e workflows, auditoria.
- **AWS HealthOmics:** armazenamento de sequências (compressão, cobrança por gigabase), workflows privados (Nextflow/WDL/CWL) e prontos.
- **Seqera Platform**, Illumina Connected Analytics/DRAGEN, Galaxy (acadêmico).
- **Critérios de decisão:** conformidade (LGPD/HIPAA, auditoria, ISO 27001), equipe disponível para manter infra, volume e previsibilidade de uso, custo total (licenças + computação + pessoas), *lock-in*, acesso a dados controlados, residência de dados.

### Armadilhas
- Subestimar o custo de pessoas para manter infraestrutura própria — ou o *lock-in* de formatos proprietários.

@@ HPC:4
> **O que esperar:** processar dados que não cabem na memória — formatos colunares (Parquet), arrays chunked (Zarr), Dask, Polars e GPUs. Base: docs Apache Arrow/Parquet, Polars, Dask, Zarr.

### Conceitos
- **Parquet:** colunar, comprimido, com estatísticas por bloco → lê só colunas/linhas necessárias; particionamento por pastas (`chrom=1/`). **Arrow:** formato em memória compartilhado entre linguagens.
- **Zarr:** arrays N-dimensionais em chunks (nuvem-friendly); base de AnnData em escala, imagens.
- **Polars:** DataFrame em Rust, multithread, **lazy** (`scan_parquet` + otimização de consulta), *streaming* out-of-core.
- **Dask:** paraleliza pandas/NumPy em blocos, em vários núcleos ou cluster; grafo de tarefas lazy (`.compute()`).
- **GPUs:** RAPIDS (cuDF, cuML), rapids-singlecell, PyTorch; ganhos grandes em operações massivamente paralelas.

### Código
```python
import polars as pl
q = (pl.scan_parquet("variants/*.parquet").filter(pl.col("af") < 0.01)
       .group_by("gene").agg(pl.len().alias("n"), pl.col("cadd").mean()).sort("n", descending=True))
df = q.collect(engine="streaming")
import dask.dataframe as dd
dd.read_parquet("variants/").query("af < 0.01").groupby("gene").size().compute()
pl.read_csv("big.csv").write_parquet("big.parquet", compression="zstd")
```

### Armadilhas
- CSV gigante lido inteiro no pandas; tipos inferidos errado (IDs com zeros à esquerda).
- Muitos arquivos Parquet minúsculos (overhead) — mire em ~100 MB–1 GB por arquivo.

@@ HPC:5
> **O que esperar:** descrever infraestrutura como código com Terraform — declarativo, estado e módulos. Base: tutoriais do Terraform (AWS/GCP).

### Conceitos
- **Declarativo:** você descreve o estado desejado; o Terraform calcula o plano de mudanças.
- **Providers** (aws, google), **resources**, **variables**, **outputs**, **data sources**.
- **State** (`terraform.tfstate`) mapeia código ↔ recursos reais; guarde em backend remoto com lock (S3 + DynamoDB/GCS); contém segredos → protegido.
- **Módulos** reutilizam blocos; ciclo `init → plan → apply → destroy`.
- Revisar o `plan` em PR (GitOps).

### Código
```hcl
terraform {
  required_providers { aws = { source = "hashicorp/aws", version = "~> 5.0" } }
  backend "s3" { bucket = "lab-tfstate", key = "dados/terraform.tfstate", region = "sa-east-1" }
}
provider "aws" { region = "sa-east-1" }
resource "aws_s3_bucket" "dados" { bucket = "meu-lab-dados" }
resource "aws_s3_bucket_public_access_block" "dados" {
  bucket = aws_s3_bucket.dados.id
  block_public_acls = true
  block_public_policy = true
  ignore_public_acls = true
  restrict_public_buckets = true
}
output "bucket" { value = aws_s3_bucket.dados.arn }
```
```bash
terraform init && terraform plan -out tf.plan && terraform apply tf.plan
```

### Armadilhas
- Editar recursos manualmente no console (drift).
- Commitar o arquivo de state ou `.tfvars` com segredos.

@@ MULTI:0
> **O que esperar:** as estratégias para integrar várias ômicas e os problemas práticos (escalas, ausentes, lotes). Base: revisões de integração multi-ômica (Argelaguet et al., Subramanian et al. 2020).

### Conceitos
- **Early (concatenação):** junta as matrizes de features → um modelo. Simples; camadas com mais features dominam.
- **Intermediate:** representação latente compartilhada (MOFA+, DIABLO, iCluster, SNF, autoencoders multimodais).
- **Late:** modelos separados por camada, combina predições/resultados.
- **Vertical** (mesmas amostras, ômicas diferentes) × **horizontal** (mesma ômica, amostras/estudos diferentes) × **diagonal**.
- **Desafios:** escalas e distribuições diferentes (contagens, intensidades, β), normalização por camada, p ≫ n, amostras ausentes em alguma camada, lotes por plataforma, interpretação biológica conjunta.

### Armadilhas
- Concatenar sem escalar cada bloco.
- Integrar para “ver o que aparece” sem pergunta; resultados difíceis de validar.

@@ MULTI:1
> **O que esperar:** métodos de fatoração que encontram eixos comuns entre ômicas — MOFA+ (não supervisionado) e DIABLO (supervisionado). Base: tutorial MOFA2 (CLL), mixOmics (DIABLO).

### Conceitos
- **MOFA+:** análise fatorial bayesiana; **fatores latentes** compartilhados por várias camadas ou específicos; variância explicada por fator × camada; lida com ausentes; pesos (loadings) por feature.
- **DIABLO (mixOmics):** PLS-DA multibloco esparso; encontra componentes correlacionados entre blocos **e** discriminantes do desfecho; matriz de design define a força da ligação entre blocos; `keepX` = nº de features selecionadas.
- Interpretação: associar fatores a covariáveis (clínicas, lote), enriquecimento dos pesos, validar em dados independentes.

### Código
```r
library(MOFA2)
mofa <- create_mofa(list(mRNA = rna, Methylation = met, Drugs = drug))
opts <- get_default_model_options(mofa); opts$num_factors <- 10
mofa <- prepare_mofa(mofa, model_options = opts) |> run_mofa(use_basilisk = TRUE)
plot_variance_explained(mofa); correlate_factors_with_covariates(mofa, covariates = c("IGHV", "trisomy12"))
library(mixOmics)
res <- block.splsda(X = list(mRNA = rna, prot = prot), Y = grupo, ncomp = 2, keepX = list(mRNA = c(20, 20), prot = c(10, 10)))
perf(res, validation = "Mfold", folds = 5, nrepeat = 10); plotIndiv(res); circosPlot(res, cutoff = .7)
```

### Armadilhas
- Fator que explica muita variância pode ser lote/qualidade.
- DIABLO sem validação cruzada superestima a separação.

@@ MULTI:2
> **O que esperar:** representar biologia como redes — coexpressão (WGCNA), interações proteína-proteína e redes regulatórias. Base: tutoriais WGCNA, STRING, SCENIC/decoupler.

### Conceitos
- **Coexpressão (WGCNA):** correlação entre genes → rede ponderada (potência β para *scale-free*) → **TOM** → módulos (clustering) → **eigengene** por módulo → correlação com traços; **hub genes** (alta conectividade intramodular).
- **PPI:** STRING (escores combinados de evidência), BioGRID, IntAct. **Centralidade:** grau, intermediação (betweenness), proximidade.
- **Redes regulatórias:** TF → alvos; inferência por coexpressão (GENIE3, ARACNe) + motivos (SCENIC: regulons), ou recursos curados (DoRothEA/CollecTRI via decoupler).
- Enriquecimento de módulos (ORA) e sobreposição com PPI.

### Código
```r
library(WGCNA)
sft <- pickSoftThreshold(datExpr, powerVector = 1:20)
net <- blockwiseModules(datExpr, power = 6, TOMType = "signed", minModuleSize = 30, mergeCutHeight = .25)
MEs <- net$MEs; cor(MEs, traits, use = "p")
```
```python
import requests
r = requests.post("https://string-db.org/api/json/network", data={"identifiers": "\r".join(genes), "species": 9606})
```

### Armadilhas
- Coexpressão ≠ interação ou regulação; correlação induzida por composição celular.
- WGCNA com poucas amostras (< 15–20) gera módulos instáveis.

@@ MULTI:3
> **O que esperar:** ligar variação genética a expressão (eQTL), testar se dois sinais compartilham a causa (colocalização) e inferir causalidade com genética (randomização mendeliana). Base: GTEx portal, coloc, TwoSampleMR.

### Conceitos
- **eQTL:** variante associada à expressão de um gene (cis: perto do gene; trans: longe). GTEx: eQTLs e sQTLs por tecido; **eGene**; tamanho de efeito (NES).
- **Colocalização (coloc):** probabilidades posteriores H0–H4; **H4** = sinal GWAS e eQTL compartilham a mesma variante causal (≠ H3, variantes distintas em LD).
- **Randomização mendeliana (MR):** variantes como **instrumentos** para uma exposição (ex.: nível de LDL) → efeito causal no desfecho. Pressupostos: (1) relevância (associada à exposição), (2) independência (sem confundidores), (3) **exclusão** (afeta o desfecho só via exposição — violada por **pleiotropia**).
- Métodos: IVW, MR-Egger (intercepto = pleiotropia direcional), mediana ponderada; sensibilidade obrigatória.

### Código
```r
library(coloc)
res <- coloc.abf(dataset1 = list(beta = g$beta, varbeta = g$se^2, snp = g$snp, type = "cc", N = 50000),
                 dataset2 = list(beta = e$beta, varbeta = e$se^2, snp = e$snp, type = "quant", N = 500))
res$summary["PP.H4.abf"]
library(TwoSampleMR); mr(dat, method_list = c("mr_ivw", "mr_egger_regression", "mr_weighted_median"))
```

### Armadilhas
- eQTL num tecido não relevante para a doença.
- Instrumentos fracos (F < 10) e pleiotropia horizontal invalidam a MR.

@@ MULTI:4
> **O que esperar:** inferir atividade de vias e TFs a partir de expressão e um panorama de modelos mecanísticos em biologia de sistemas. Base: PROGENy/decoupler, revisões de modelagem de sistemas.

### Conceitos
- **Atividade × expressão:** a expressão dos genes da via não diz se ela está ativa; **footprints** (genes-alvo responsivos) sim.
- **PROGENy:** 14 vias (EGFR, MAPK, PI3K, TNFa, NFkB, Hypoxia, p53, TGFb…) com pesos de genes responsivos derivados de perturbações. **CollecTRI/DoRothEA:** regulons de TFs.
- **decoupler:** framework para estimar atividades (ULM, MLM, WSUM, VIPER) em bulk ou single-cell.
- **Modelos mecanísticos:** ODEs de cinética (SBML, COPASI), modelos booleanos/lógicos (CellNOpt), **FBA** — análise de balanço de fluxo em redes metabólicas em escala genômica (COBRApy).

### Código
```python
import decoupler as dc
progeny = dc.op.progeny(organism="human", top=500)
acts, pvals = dc.mt.ulm(data=stat_df, net=progeny)     # stat_df: genes × contrastes (ex.: estatística de Wald)
tfs = dc.op.collectri(organism="human"); tf_acts, _ = dc.mt.ulm(data=stat_df, net=tfs)
import cobra
m = cobra.io.load_model("textbook"); sol = m.optimize(); sol.objective_value
```

### Armadilhas
- Pesos derivados de linhagens celulares podem não refletir seu tecido.
- Ver nomes das funções da versão instalada do decoupler (a API mudou entre versões 1.x e 2.x).
