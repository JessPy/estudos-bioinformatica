# Deep learning, LLMs, Engenharia II, Ferramentas, Liderança, Carreira

@@ DL:0
> **O que esperar:** como uma rede neural aprende — camadas, ativação, backpropagation, otimizadores e regularização. Base: Karpathy “micrograd”, Deep Learning Book (Goodfellow) / d2l.ai.

### Conceitos
- **MLP:** camadas lineares (Wx + b) + **não linearidade** (ReLU, GELU, sigmoid, tanh). Sem não linearidade, várias camadas = uma linear.
- **Perda:** MSE (regressão), entropia cruzada (classificação; logits + softmax).
- **Backpropagation:** regra da cadeia no grafo computacional, do fim para o início (autograd).
- **Otimizadores:** SGD (+ momentum), **Adam/AdamW** (taxas adaptativas; W = weight decay desacoplado); *learning rate schedules* (warmup, cosine).
- **Regularização:** weight decay (L2), **dropout**, early stopping, data augmentation. **Normalização:** BatchNorm, LayerNorm (estabiliza o treino).
- Inicialização (He/Xavier), gradientes que somem/explodem (clipping, conexões residuais).

### Código
```python
# micrograd-style: um neurônio
class Value:
    def __init__(s, data, _prev=()): s.data, s.grad, s._prev, s._back = data, 0.0, _prev, lambda: None
    def __mul__(s, o):
        out = Value(s.data * o.data, (s, o))
        def _back(): s.grad += o.data * out.grad; o.grad += s.data * out.grad
        out._back = _back; return out
# NumPy: forward/backward de 1 camada oculta
h = np.maximum(0, X @ W1 + b1); logits = h @ W2 + b2
dlogits = (softmax(logits) - Y) / len(X); dW2 = h.T @ dlogits; dh = dlogits @ W2.T * (h > 0); dW1 = X.T @ dh
```

### Armadilhas
- Não checar se a rede consegue overfitar um lote pequeno (teste de sanidade).
- Taxa de aprendizado errada é a causa nº 1 de treino que não converge.

@@ DL:1
> **O que esperar:** treinar modelos em PyTorch — tensores, autograd, Dataset/DataLoader, loop de treino com validação e GPU. Base: tutoriais básicos do PyTorch.

### Conceitos
- **Tensor** (como ndarray, em CPU/GPU, com `requires_grad`). `nn.Module` define camadas em `__init__` e o cálculo em `forward`.
- **Dataset** (`__len__`, `__getitem__`) + **DataLoader** (lotes, `shuffle`, `num_workers`).
- Loop: `model.train()` → forward → loss → `optimizer.zero_grad()` → `loss.backward()` → `optimizer.step()`; validação com `model.eval()` + `torch.no_grad()`.
- **Early stopping:** guarda o melhor checkpoint pela métrica de validação.
- **GPU:** `.to(device)` no modelo e nos lotes; mixed precision (`torch.autocast`).

### Código
```python
import torch, torch.nn as nn
dev = "cuda" if torch.cuda.is_available() else "cpu"
model = nn.Sequential(nn.Linear(p, 128), nn.ReLU(), nn.Dropout(.3), nn.Linear(128, 2)).to(dev)
opt = torch.optim.AdamW(model.parameters(), lr=1e-3, weight_decay=1e-2); lossf = nn.CrossEntropyLoss()
best, wait = float("inf"), 0
for epoch in range(200):
    model.train()
    for xb, yb in train_dl:
        xb, yb = xb.to(dev), yb.to(dev); opt.zero_grad(); loss = lossf(model(xb), yb); loss.backward(); opt.step()
    model.eval()
    with torch.no_grad(): vl = sum(lossf(model(x.to(dev)), y.to(dev)).item() for x, y in val_dl) / len(val_dl)
    if vl < best: best, wait = vl, 0; torch.save(model.state_dict(), "best.pt")
    elif (wait := wait + 1) >= 10: break
```

### Armadilhas
- Esquecer `zero_grad` (gradientes acumulam) ou `model.eval()` (dropout ativo na validação).
- Não fixar sementes (`torch.manual_seed`) e ignorar não determinismo da GPU.

@@ DL:2
> **O que esperar:** CNNs para sequências de DNA — codificação one-hot, filtros como detectores de motivos e interpretação. Base: DeepBind/Basset/Basenji, tutoriais de genômica com DL (Kipoi, Koo & Ploenzke).

### Conceitos
- **One-hot:** sequência de L bases → matriz 4 × L (A, C, G, T); N = zeros ou 0,25.
- **Conv1D:** cada filtro (largura ~8–20) varre a sequência — funciona como uma **PWM aprendida**; ReLU + **max pooling** dão invariância de posição.
- Camadas profundas/dilatadas capturam combinações e interações de longo alcance (Basenji, Enformer).
- **Interpretação:** **saliência**/gradiente × entrada, **DeepLIFT/Integrated Gradients** (atribuição por base), **in silico mutagenesis** (mutar cada posição e medir a mudança na predição), filtros → motivos comparados ao JASPAR (TomTom); TF-MoDISco agrega.
- Considere o complemento reverso (augmentation ou camadas RC-equivariantes).

### Código
```python
def onehot(seq):
    m = {"A": 0, "C": 1, "G": 2, "T": 3}; x = np.zeros((4, len(seq)), np.float32)
    for i, b in enumerate(seq):
        if b in m: x[m[b], i] = 1
    return x
model = nn.Sequential(nn.Conv1d(4, 64, 19, padding=9), nn.ReLU(), nn.MaxPool1d(10),
                      nn.Conv1d(64, 64, 7, padding=3), nn.ReLU(), nn.AdaptiveMaxPool1d(1), nn.Flatten(), nn.Linear(64, 1))
```

### Armadilhas
- Background mal escolhido (ex.: GC diferente dos picos) → a rede aprende GC, não motivos.
- Split aleatório com sequências homólogas/sobrepostas em treino e teste → separe por **cromossomo**.

@@ DL:3
> **O que esperar:** atenção e Transformers, e modelos de linguagem de proteínas e DNA (ESM-2, Nucleotide Transformer etc.) com transfer learning. Base: “Attention is all you need”, The Illustrated Transformer, docs ESM/Hugging Face.

### Conceitos
- **Atenção:** cada token cria query, key, value; peso = softmax(QKᵀ/√d); mistura os values → contexto. **Multi-head** = várias “perspectivas”.
- **Embeddings posicionais** (seno/cosseno, aprendidos, RoPE) dão ordem.
- **Pré-treino** auto-supervisionado: **masked language modeling** (ESM, DNABERT) ou próximo token (Evo, modelos GPT).
- **ESM-2:** treinado em UniRef; embeddings por resíduo e médios por proteína; usados para estrutura (ESMFold), efeito de variantes, função.
- **DNA:** Nucleotide Transformer, DNABERT-2, HyenaDNA, Evo (contextos longos).
- **Transfer learning:** extrair embeddings + classificador simples (*linear probing*) ou fine-tuning (completo/LoRA).

### Código
```python
import torch, esm
model, alphabet = esm.pretrained.esm2_t33_650M_UR50D(); bc = alphabet.get_batch_converter(); model.eval()
_, _, toks = bc([("p1", "MKTAYIAKQRQISFVKSHFSRQ")])
with torch.no_grad(): rep = model(toks, repr_layers=[33])["representations"][33]
emb = rep[0, 1:-1].mean(0)        # média por proteína (remove BOS/EOS)
# depois: LogisticRegression em [emb...] vs. features de composição/k-mers
```

### Armadilhas
- Vazamento por homologia: proteínas similares (> 30–40% identidade) em treino e teste → agrupe com MMseqs2 antes do split.
- Comparar com baselines simples (k-mers, one-hot + CNN) antes de concluir que o LM ajuda.

@@ DL:4
> **O que esperar:** redes neurais em grafos — passagem de mensagens e aplicações em moléculas e redes biológicas. Base: tutoriais do PyTorch Geometric, Hamilton “Graph Representation Learning”.

### Conceitos
- Grafo: nós (átomos, proteínas, células), arestas (ligações, interações), features de nós/arestas.
- **Message passing:** cada camada agrega mensagens dos vizinhos e atualiza o nó: hᵥ ← UPDATE(hᵥ, AGG{MSG(hᵤ)}). k camadas = campo receptivo de k saltos.
- Variantes: **GCN** (média normalizada), **GraphSAGE** (amostragem de vizinhos), **GAT** (atenção), **GIN** (expressivo; soma).
- Tarefas: nó (função de proteína em PPI), aresta (predição de interação/link), **grafo** (propriedade de molécula → *readout*/pooling global).
- Problemas: *over-smoothing* (muitas camadas igualam os nós), grafos heterogêneos.

### Código
```python
from torch_geometric.datasets import TUDataset
from torch_geometric.loader import DataLoader
from torch_geometric.nn import GCNConv, global_mean_pool
ds = TUDataset("data/TU", name="MUTAG").shuffle()
class GNN(torch.nn.Module):
    def __init__(s, h=64):
        super().__init__(); s.c1 = GCNConv(ds.num_node_features, h); s.c2 = GCNConv(h, h); s.lin = torch.nn.Linear(h, ds.num_classes)
    def forward(s, x, edge_index, batch):
        x = s.c1(x, edge_index).relu(); x = s.c2(x, edge_index).relu()
        return s.lin(global_mean_pool(x, batch))
```

### Armadilhas
- Split aleatório de moléculas parecidas → use *scaffold split*.
- Em redes PPI, vazamento de arestas entre treino e teste na predição de links.

@@ DL:5
> **O que esperar:** modelos generativos — autoencoders variacionais (base do scVI) e difusão (design de proteínas). Base: Kingma & Welling (VAE), Lopez et al. 2018 (scVI), revisões de difusão (RFdiffusion).

### Conceitos
- **Autoencoder:** encoder comprime x → z, decoder reconstrói. **VAE:** encoder dá μ e σ de q(z|x); **truque da reparametrização** z = μ + σ·ε; perda = reconstrução + **KL**(q(z|x) ‖ N(0, I)) → espaço latente contínuo e amostrável.
- **scVI:** VAE com verossimilhança **ZINB/NB** para contagens, tamanho de biblioteca e **lote** como covariáveis → latente integrado, normalização, DE.
- **Difusão:** aprende a **remover ruído** passo a passo; geração = partir de ruído e iterar. Em proteínas: **RFdiffusion** (gera backbones), **ProteinMPNN** (desenha a sequência para o backbone), AlphaFold para checar.
- Outros: GANs, normalizing flows, modelos autoregressivos.

### Código
```python
class VAE(nn.Module):
    def __init__(s, p, z=10):
        super().__init__(); s.enc = nn.Sequential(nn.Linear(p, 128), nn.ReLU()); s.mu = nn.Linear(128, z); s.lv = nn.Linear(128, z)
        s.dec = nn.Sequential(nn.Linear(z, 128), nn.ReLU(), nn.Linear(128, p))
    def forward(s, x):
        h = s.enc(x); mu, lv = s.mu(h), s.lv(h); zz = mu + torch.randn_like(mu) * (0.5 * lv).exp()
        return s.dec(zz), mu, lv
def loss(xh, x, mu, lv): return nn.functional.mse_loss(xh, x, reduction="sum") - 0.5 * torch.sum(1 + lv - mu**2 - lv.exp())
```

### Armadilhas
- *Posterior collapse* (KL domina e z é ignorado) → KL annealing.
- MSE em contagens brutas: transforme (log1p) ou use verossimilhança NB.

@@ LLM:0
> **O que esperar:** como LLMs funcionam e falham — tokenização, pré-treino por próximo token, fine-tuning, alinhamento e limites. Base: Karpathy “Let's build GPT” e nanoGPT, “Intro to Large Language Models”.

### Conceitos
- **Tokenização** (BPE): texto → subpalavras; custo e contexto contados em tokens; sequências de DNA/aminoácidos tokenizam mal em modelos de texto.
- **Pré-treino:** prever o próximo token em trilhões de tokens → modelo base (Transformer decoder, atenção causal).
- **Fine-tuning supervisionado (SFT)** em instruções → assistente; **alinhamento** (RLHF, RLAIF, DPO) por preferências.
- **Inferência:** amostragem com **temperatura**, top-p; janela de contexto limitada.
- **Limites:** **alucinação** (texto plausível, falso — inclusive citações), conhecimento com data de corte, sensível ao prompt, raciocínio numérico frágil, vieses.

### Código
```python
# nanoGPT mínimo: bigram → atenção causal
class Head(nn.Module):
    def __init__(s, n_embd, hs, block):
        super().__init__(); s.k, s.q, s.v = (nn.Linear(n_embd, hs, bias=False) for _ in range(3))
        s.register_buffer("tril", torch.tril(torch.ones(block, block)))
    def forward(s, x):
        B, T, C = x.shape; k, q = s.k(x), s.q(x)
        w = (q @ k.transpose(-2, -1)) * k.shape[-1] ** -0.5
        w = w.masked_fill(s.tril[:T, :T] == 0, float("-inf")).softmax(-1)
        return w @ s.v(x)
```

### Armadilhas
- Usar LLM como fonte factual sem verificação (genes, variantes, referências).

@@ LLM:1
> **O que esperar:** escrever prompts que dão resultados confiáveis e medir a qualidade das saídas. Base: guias de engenharia de prompt da Anthropic/OpenAI, literatura de avaliação.

### Conceitos
- **Clareza:** papel/contexto, tarefa, formato de saída, critérios; dados delimitados (tags XML ou blocos).
- **Exemplos (few-shot)** variados, incluindo casos difíceis e “nenhum encontrado”.
- **Saídas estruturadas:** JSON Schema / tool use para garantir formato; validar com pydantic.
- Peça para citar o trecho de origem (*grounding*) e permita “não sei”.
- **Avaliação:** conjunto anotado manualmente (gold), métricas (precisão, recall, F1 por entidade), comparação de versões de prompt, LLM-as-judge com rubrica (validado contra humanos).
- Temperatura baixa para extração.

### Código
```python
from pydantic import BaseModel
class Entidades(BaseModel):
    genes: list[str]; variantes: list[str]; doencas: list[str]
prompt = f"""Extraia do resumo entre <abstract> os genes (símbolo HGNC), variantes (HGVS ou rsID) e doenças.
Use só o que estiver explícito no texto. Se não houver, devolva lista vazia.
Responda apenas com JSON no formato {{"genes": [], "variantes": [], "doencas": []}}.
<abstract>{texto}</abstract>"""
pred = Entidades.model_validate_json(resposta)
tp = len(set(pred.genes) & set(gold.genes)); prec = tp / max(len(pred.genes), 1); rec = tp / max(len(gold.genes), 1)
```

### Armadilhas
- Ajustar o prompt olhando os mesmos exemplos que usa para avaliar (overfitting de prompt).
- Normalizar nomes antes de comparar (sinônimos de genes, maiúsculas).

@@ LLM:2
> **O que esperar:** buscar informação relevante em literatura com embeddings e gerar respostas fundamentadas com citações (RAG). Base: guias de RAG, docs de bancos vetoriais, E-utilities para PubMed.

### Conceitos
- **Pipeline RAG:** ingestão → **chunking** (por seção/parágrafo, 200–800 tokens, sobreposição) → **embeddings** → índice vetorial → recuperação (top-k) → (re-ranking) → prompt com trechos → resposta **com citações**.
- **Busca híbrida:** BM25 (palavras exatas: nomes de genes, rsIDs) + vetorial (semântica); combinação por RRF.
- **Re-ranker** (cross-encoder) melhora a precisão do top-k.
- **Grounding:** instruir a usar só os trechos, citar PMIDs, dizer quando não há evidência.
- **Avaliação:** recuperação (recall@k, MRR) e geração (fidelidade às fontes, corretude, cobertura de citações) num conjunto de perguntas com respostas conhecidas.

### Código
```python
from Bio import Entrez
ids = Entrez.read(Entrez.esearch(db="pubmed", term="BRCA1 PARP inhibitor", retmax=200))["IdList"]
xml = Entrez.efetch(db="pubmed", id=",".join(ids), rettype="abstract", retmode="xml").read()
from sentence_transformers import SentenceTransformer
emb = SentenceTransformer("BAAI/bge-small-en-v1.5"); E = emb.encode(chunks, normalize_embeddings=True)
import faiss; idx = faiss.IndexFlatIP(E.shape[1]); idx.add(E)
D, I = idx.search(emb.encode([pergunta], normalize_embeddings=True), 8)
```

### Armadilhas
- Chunks que cortam a frase com o resultado; perder metadados (PMID, ano, seção).
- Avaliar só se a resposta “parece boa”.

@@ LLM:3
> **O que esperar:** agentes que usam ferramentas (APIs, código, bancos) em loop, o protocolo MCP e como supervisioná-los. Base: docs de tool use da Anthropic, especificação do Model Context Protocol.

### Conceitos
- **Tool use:** você descreve ferramentas (nome, descrição, JSON Schema de entrada); o modelo decide chamar; seu código executa e devolve o resultado.
- **Loop agêntico:** pensar → chamar ferramenta → observar → repetir até responder; limite de passos e custo.
- **MCP:** padrão aberto para expor ferramentas, recursos e prompts a clientes de IA via servidores (stdio/HTTP).
- **Boas ferramentas:** poucas, bem descritas, saídas compactas, erros informativos; idempotentes quando possível.
- **Supervisão humana:** aprovação para ações irreversíveis; logs de todas as chamadas; sandbox para execução de código; permissões mínimas.
- **Riscos:** *prompt injection* via conteúdo recuperado, loops, ações não autorizadas, dados sensíveis enviados a terceiros.

### Código
```python
from mcp.server.fastmcp import FastMCP
import requests
mcp = FastMCP("bioinfo-tools")

@mcp.tool()
def ensembl_lookup(symbol: str, species: str = "homo_sapiens") -> dict:
    """Retorna ID Ensembl, coordenadas e biotipo de um gene pelo símbolo."""
    r = requests.get(f"https://rest.ensembl.org/lookup/symbol/{species}/{symbol}", headers={"Content-Type": "application/json"}, timeout=30)
    r.raise_for_status(); d = r.json()
    return {k: d[k] for k in ("id", "seq_region_name", "start", "end", "strand", "biotype")}

if __name__ == "__main__":
    mcp.run()
```

### Armadilhas
- Ferramenta que devolve JSON gigante enche o contexto; resuma.
- Confiar em instruções vindas de páginas/documentos recuperados.

@@ LLM:4
> **O que esperar:** usar IA com responsabilidade em ciência e saúde — avaliação, segurança, privacidade (LGPD) e governança. Base: LGPD (Lei 13.709/2018), guias de governança de IA (NIST AI RMF), políticas institucionais.

### Conceitos
- **Dados genéticos e de saúde são dados pessoais sensíveis** (LGPD art. 5º, II): exigem base legal específica, finalidade, minimização e segurança reforçada.
- Genoma é **difícil de anonimizar** (reidentificação por parentes/bancos de genealogia).
- **Riscos com LLMs:** envio de dados a terceiros (termos de uso, retenção, treino), vazamento por prompts/logs, alucinação em contexto clínico, viés.
- **Controles:** classificação de dados, modelos locais ou contratos com garantias (sem retenção/treino, região), pseudonimização antes do envio, controle de acesso, registro e auditoria, avaliação antes do uso, humano no circuito para decisões.
- **Governança:** política de uso, inventário de casos de uso, avaliação de impacto (RIPD), responsáveis, revisão periódica.

### Esqueleto de política de uso de IA
1. Escopo e definições  2. Usos permitidos / proibidos  3. Classificação de dados (público, interno, sensível)  4. Ferramentas aprovadas e configurações  5. Revisão humana obrigatória  6. Registro e auditoria  7. Incidentes  8. Treinamento e revisão anual

### Armadilhas
- Colar VCF/laudo de paciente num chatbot público.

@@ LLM:5
> **O que esperar:** adaptar modelos com fine-tuning eficiente (LoRA/PEFT) e decidir entre ajustar, usar RAG ou só prompt; panorama de modelos fundacionais biológicos. Base: Hu et al. 2021 (LoRA), docs Hugging Face PEFT.

### Conceitos
- **LoRA:** congela os pesos e treina matrizes de baixo posto A·B adicionadas a camadas (atenção) → poucos parâmetros, cabe em GPU modesta. **QLoRA:** modelo base quantizado em 4 bits.
- Hiperparâmetros: `r` (posto, 4–64), `lora_alpha`, `target_modules`, dropout, taxa de aprendizado maior que no fine-tuning completo.
- **Quando:** prompt (mais barato, primeiro) → **RAG** (conhecimento que muda/precisa de fonte) → **fine-tuning** (formato/estilo/tarefa específica consistente, classificação, latência/custo).
- **Modelos fundacionais biológicos:** proteínas (ESM, ProtT5), DNA (Nucleotide Transformer, Evo), single-cell (scGPT, Geneformer), estrutura (AlphaFold, ESMFold). Compare sempre com baselines simples.

### Código
```python
from transformers import AutoModelForSequenceClassification, AutoTokenizer, TrainingArguments, Trainer
from peft import LoraConfig, get_peft_model
name = "facebook/esm2_t12_35M_UR50D"
model = AutoModelForSequenceClassification.from_pretrained(name, num_labels=2)
model = get_peft_model(model, LoraConfig(r=8, lora_alpha=16, lora_dropout=.1, target_modules=["query", "value"], task_type="SEQ_CLS"))
model.print_trainable_parameters()
Trainer(model=model, args=TrainingArguments("out", learning_rate=5e-4, num_train_epochs=5, eval_strategy="epoch"),
        train_dataset=tr, eval_dataset=va).train()
```

### Armadilhas
- Fine-tuning para “ensinar fatos” (melhor RAG).
- Avaliar no mesmo domínio/homologia do treino.

@@ ENG2:0
> **O que esperar:** automatizar testes, lint, builds e releases com GitHub Actions. Base: GitHub Actions docs (workflows, matrix, cache, secrets).

### Conceitos
- **Workflow** (`.github/workflows/*.yml`) → **jobs** (rodam em paralelo em runners) → **steps** (`uses:` ações prontas ou `run:` comandos).
- **Gatilhos:** `push`, `pull_request`, `schedule`, `workflow_dispatch`, `release`/tags.
- **Matrix:** várias versões/SO; **cache** de dependências; **artifacts** entre jobs.
- **Secrets** (tokens, credenciais) e permissões mínimas do `GITHUB_TOKEN`; OIDC para nuvem sem chaves longas.
- **Releases:** tag `v1.2.0` → build → publicar pacote/container.

### Código
```yaml
name: CI
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    strategy: { matrix: { python: ["3.10", "3.12"] } }
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with: { python-version: "${{ matrix.python }}", cache: pip }
      - run: pip install -e ".[dev]"
      - run: ruff check . && pytest --cov
  docker:
    if: startsWith(github.ref, 'refs/tags/v')
    needs: test
    runs-on: ubuntu-latest
    permissions: { contents: read, packages: write }
    steps:
      - uses: actions/checkout@v4
      - uses: docker/login-action@v3
        with: { registry: ghcr.io, username: "${{ github.actor }}", password: "${{ secrets.GITHUB_TOKEN }}" }
      - uses: docker/build-push-action@v6
        with: { push: true, tags: "ghcr.io/${{ github.repository }}:${{ github.ref_name }}" }
```

### Armadilhas
- Ações de terceiros sem versão fixa (fixe por tag ou SHA).
- Imprimir secrets em logs; rodar workflows de PRs de forks com secrets.

@@ ENG2:1
> **O que esperar:** arquitetura de sistemas de dados em laboratórios — LIMS, metadados, data lakes, catálogos e APIs. Base: docs FastAPI, literatura de LIMS/gestão de dados.

### Conceitos
- **LIMS:** rastreia amostras (recebimento → extração → biblioteca → corrida), cadeia de custódia, reagentes e lotes. Fonte da verdade dos metadados.
- **Data lake** (objetos brutos/baratos) × **data warehouse** (tabelas curadas, analítico) × *lakehouse* (Parquet/Delta/Iceberg + catálogo).
- **Catálogo de dados/metadados:** o que existe, onde, versão, dono, linhagem (proveniência).
- **APIs REST** com **contrato** (OpenAPI): versões (`/v1`), paginação, códigos de erro, autenticação; testes de contrato.
- Separar camadas: ingestão → processamento (pipelines) → resultados → serviço (API/dashboards).

### Código
```python
from fastapi import FastAPI, HTTPException, Query
from pydantic import BaseModel
app = FastAPI(title="Resultados de pipeline", version="1.0")
class Amostra(BaseModel):
    sample_id: str; status: str; mean_cov: float | None = None
@app.get("/v1/samples/{sample_id}", response_model=Amostra)
def get_sample(sample_id: str):
    row = db.get(sample_id)
    if not row: raise HTTPException(404, "amostra não encontrada")
    return row
@app.get("/v1/samples", response_model=list[Amostra])
def list_samples(limit: int = Query(50, le=500), offset: int = 0): return db.list(limit, offset)
# testes: from fastapi.testclient import TestClient; TestClient(app).get("/v1/samples/S1").status_code == 200
```
```bash
uvicorn api:app --reload    # docs automáticas em /docs
```

### Armadilhas
- Metadados em planilhas soltas por pessoa; IDs de amostra inconsistentes entre sistemas.

@@ ENG2:2
> **O que esperar:** tornar dados FAIR usando identificadores persistentes, ontologias e padrões de metadados (MIxS, GA4GH). Base: Wilkinson et al. 2016 (FAIR), GSC (MIxS), GA4GH.

### Conceitos
- **FAIR:** **F**indable (ID persistente, metadados ricos, indexado), **A**ccessible (protocolo aberto, autenticação quando necessário, metadados acessíveis mesmo sem os dados), **I**nteroperable (formatos e vocabulários padrão), **R**eusable (licença, proveniência, padrões da comunidade). FAIR ≠ aberto.
- **IDs persistentes:** DOI (datasets, software), ORCID (pessoas), ROR (instituições), acessos INSDC (SRA/ENA: PRJ/SAM/ERR).
- **Ontologias:** termos controlados com IDs — GO, **EFO**, UBERON (anatomia), CL (célula), MONDO/HPO (doenças/fenótipos), NCBITaxon, ENVO (ambiente).
- **MIxS:** checklists mínimos para sequências (MIMS, MIMARKS) + pacotes ambientais.
- **GA4GH:** padrões para genômica (htsget, refget, Beacon, DRS, WES/TES, Phenopackets, Passports para acesso).

### Checklist rápido
- [ ] Dados depositados (ENA/SRA/GEO/PRIDE/Zenodo) com acesso persistente
- [ ] Metadados com ontologias e checklist MIxS
- [ ] Licença clara (CC-BY / CC0) ou termos de acesso
- [ ] Código e versões das ferramentas citados (DOI do software)

@@ ENG2:3
> **O que esperar:** governança, segurança e privacidade de dados genômicos sob a LGPD. Base: LGPD (Lei 13.709/2018), guias da ANPD, boas práticas de segurança da informação (ISO 27001).

### Conceitos
- **Dado pessoal sensível:** genético, biométrico, saúde. **Bases legais** (art. 11): consentimento específico e destacado, obrigação legal, pesquisa por órgão de pesquisa (com anonimização sempre que possível), tutela da saúde etc.
- **Princípios:** finalidade, necessidade (minimização), transparência, segurança, prevenção, responsabilização.
- **Papéis:** controlador, operador, encarregado (DPO). **Direitos do titular:** acesso, correção, eliminação, portabilidade, revogação.
- **Anonimização × pseudonimização:** dado anonimizado não é pessoal (se irreversível por meios razoáveis); genomas raramente são verdadeiramente anônimos.
- **Controles:** classificação de dados, controle de acesso por papel (RBAC), privilégio mínimo, criptografia, logs de acesso, segregação de ambientes, plano de **retenção e descarte**, resposta a incidentes (comunicação à ANPD), **RIPD**.

### Matriz de acesso (exemplo)
| Dado | Bioinformata | Pesquisador | Laudo/clínico | Externo |
|---|---|---|---|---|
| FASTQ/BAM identificados | leitura (projeto) | não | não | não |
| VCF pseudonimizado | leitura | leitura | leitura | DUA |
| Laudo | não | não | leitura/escrita | não |

### Armadilhas
- Guardar “para sempre por precaução” viola necessidade; defina prazos.

@@ ENG2:4
> **O que esperar:** como pipelines são validados e controlados em ambientes clínicos/regulados (CAP/CLIA, ISO 15189). Base: Roy et al. 2018 (AMP/CAP — standards for validation of NGS bioinformatics pipelines), ISO 15189.

### Conceitos
- **Validação analítica:** demonstrar desempenho com amostras de referência (GIAB, amostras com variantes conhecidas): **sensibilidade, especificidade/PPV, reprodutibilidade, repetibilidade, limite de detecção (VAF mínima), regiões reportáveis**, por tipo de variante.
- **Pipeline “travado”:** versões fixas de ferramentas, bancos, referência e parâmetros; qualquer mudança → revalidação proporcional (*change control*).
- **Rastreabilidade:** cada laudo ligado à amostra, corrida, versão do pipeline, logs, QC; documentos (SOPs) controlados.
- **QC por corrida/amostra** com critérios de aceite (cobertura mínima, % bases ≥ 20×, contaminação, sexo concordante).
- **Gestão da qualidade:** não conformidades, ações corretivas (CAPA), auditorias, proficiência (ensaios interlaboratoriais).

### Armadilhas
- Atualizar o banco de anotação (ex.: ClinVar) sem registrar a versão no laudo.
- Validar só com SNVs e reportar indels/CNVs.

@@ ENG2:5
> **O que esperar:** registrar decisões técnicas e seus trade-offs para a equipe e para o “você do futuro”. Base: Nygard (Architecture Decision Records), templates MADR.

### Conceitos
- **ADR:** documento curto e imutável por decisão significativa: **título, status** (proposta/aceita/substituída), **contexto** (forças, restrições), **decisão**, **consequências** (positivas e negativas), alternativas consideradas.
- Guardar no repositório (`docs/adr/0001-usar-nextflow.md`), numerados; uma nova decisão **substitui** a antiga (não edita).
- **Trade-offs** típicos: custo × desempenho × simplicidade × lock-in × conhecimento da equipe × prazo.
- Design doc (ver COM:4) para propostas maiores; ADR para a decisão final.

### Modelo
```markdown
# ADR 0003 — Armazenar resultados em Parquet no S3
Status: aceita (2026-11-06)
## Contexto
Tabelas de variantes com 2 bi de linhas; consultas analíticas por gene/AF; equipe usa Python e R.
## Decisão
Parquet particionado por cromossomo, consultado com DuckDB; catálogo em Glue.
## Alternativas
PostgreSQL (caro em escala, bom para transações); BigQuery (lock-in, custo por consulta).
## Consequências
+ barato, colunar, multiplataforma. − sem transações; exige compactação periódica.
```

@@ TOOL:0
> **O que esperar:** escolher qual ferramenta vale a pena construir — usuários, requisitos e estado da arte. Base: guias de desenvolvimento de software científico (ten simple rules for making research software more robust).

### Conceitos
- Comece por uma **dor real e recorrente** (sua ou de colegas) — não por uma tecnologia.
- **Usuários:** quem (bancada, bioinformata, clínico), em que ambiente (CLI, HPC, web, Galaxy), com que dados e volume.
- **Requisitos:** funcionais (o que faz) e não funcionais (desempenho, memória, instalação, formatos de entrada/saída padrão).
- **Estado da arte:** buscar em bio.tools, Bioconda, Bioconductor, GitHub, artigos; se existe algo 80% bom, **contribua** em vez de reescrever.
- **Escopo mínimo** (MVP) e critérios de sucesso mensuráveis (ex.: 10× mais rápido, X usuários).

### Template de escopo
- Problema (1 frase) · Usuário-alvo · Entradas/saídas · O que já existe e por que não serve · MVP · Fora do escopo · Métrica de sucesso

@@ TOOL:1
> **O que esperar:** acelerar o código Python quando necessário — Numba (JIT), Cython e extensões em Rust via PyO3. Base: docs Numba, Cython, PyO3/maturin.

### Conceitos
- **Quando:** depois de perfilar, se o gargalo é um loop numérico que não vetoriza bem (ex.: contagem de k-mers, DP de alinhamento).
- **Numba:** `@njit` compila funções com NumPy/loops para código nativo; `parallel=True` + `prange`; não aceita objetos Python arbitrários.
- **Cython:** Python com tipos C → extensão compilada; bom para envolver C/C++.
- **Rust + PyO3 + maturin:** extensões seguras e rápidas; `maturin develop` compila e instala; empacotamento com wheels.
- Codificar k-mers como inteiros (2 bits por base) evita strings e dicionários.

### Código
```python
from numba import njit
@njit
def kmer_counts(codes, k):
    out = np.zeros(4 ** k, np.int64); mask = 4 ** k - 1; h = 0
    for i in range(codes.size):
        h = ((h << 2) | codes[i]) & mask
        if i >= k - 1: out[h] += 1
    return out
codes = np.frombuffer(seq.encode(), np.uint8); codes = np.searchsorted(np.array([65, 67, 71, 84]), codes)  # A C G T → 0..3
```
```rust
use pyo3::prelude::*;
#[pyfunction]
fn gc(seq: &str) -> f64 { let n = seq.bytes().filter(|b| *b == b'G' || *b == b'C').count(); n as f64 / seq.len() as f64 }
#[pymodule]
fn fastk(m: &Bound<'_, PyModule>) -> PyResult<()> { m.add_function(wrap_pyfunction!(gc, m)?)?; Ok(()) }
```
```bash
maturin new --bindings pyo3 fastk && maturin develop --release
```

### Armadilhas
- Medir o primeiro call do Numba (inclui compilação).
- Bases N/minúsculas não tratadas quebram a codificação.

@@ TOOL:2
> **O que esperar:** comparar métodos de forma justa — dados, verdades, métricas e neutralidade. Base: Weber et al. 2019 (Essential guidelines for computational method benchmarking).

### Conceitos
- **Propósito:** apresentar um método novo × benchmark neutro × desafio comunitário.
- **Métodos:** todos os relevantes, versões e parâmetros documentados; parâmetros padrão vs ajustados **de forma igual** para todos (não só para o seu).
- **Dados:** **simulados** (verdade conhecida, mas podem não refletir a realidade) + **reais** com verdade de referência (GIAB, mocks, spike-ins, validação experimental) — vários datasets e cenários.
- **Métricas:** acurácia (precisão/recall/F1, erro), **desempenho computacional** (tempo, memória, escalabilidade), usabilidade, estabilidade.
- **Neutralidade e reprodutibilidade:** código, containers e dados públicos; resultados por cenário (não só média); rankings com incerteza.

### Plano de benchmark (modelo)
1. Pergunta e escopo · 2. Métodos e versões · 3. Datasets (simulados + reais) e verdades · 4. Métricas · 5. Infraestrutura (mesma máquina, repetições) · 6. Análise (por cenário, intervalos) · 7. Publicação de tudo

### Armadilhas
- Testar o seu método nos dados em que ele foi desenvolvido (*self-assessment trap*).

@@ TOOL:3
> **O que esperar:** distribuir a ferramenta onde os usuários estão — PyPI, Bioconda, Bioconductor, containers e módulos nf-core. Base: guias de contribuição Bioconda, Bioconductor e nf-core.

### Conceitos
- **PyPI:** wheels/sdist com `python -m build` + `twine` (ou trusted publishing via GitHub Actions).
- **Bioconda:** receita `meta.yaml` (fonte com **sha256**, build, dependências, **test**, about/licença) em PR no `bioconda-recipes`; revisão por pares; gera BioContainer automaticamente; atualizações via bot.
- **Bioconductor:** pacote R com vinheta, testes, `BiocCheck`, revisão manual; ciclos de release semestrais.
- **Containers:** Docker/Apptainer com tags versionadas.
- **nf-core module:** `nf-core modules create` → `main.nf`, `meta.yml`, testes nf-test, container BioContainers.
- **Manutenção:** responder issues, versionar (SemVer), CHANGELOG, depreciações anunciadas.

### Código
```yaml
# recipes/kmertools/meta.yaml
package: { name: kmertools, version: "0.2.0" }
source:
  url: https://pypi.io/packages/source/k/kmertools/kmertools-0.2.0.tar.gz
  sha256: <hash>
build: { number: 0, noarch: python, script: "{{ PYTHON }} -m pip install . -vv", entry_points: ["kmertools = kmertools.cli:main"] }
requirements: { host: [python >=3.10, pip, hatchling], run: [python >=3.10, biopython] }
test: { commands: ["kmertools --help"] }
about: { home: https://github.com/user/kmertools, license: MIT, summary: "Contagem rápida de k-mers" }
```
```bash
bioconda-utils build recipes config.yml --packages kmertools   # ou: conda build recipes/kmertools
```

@@ TOOL:4
> **O que esperar:** tornar o software citável e publicá-lo — CITATION.cff, DOI no Zenodo e o processo do JOSS. Base: JOSS review criteria, Citation File Format, integração GitHub–Zenodo.

### Conceitos
- **CITATION.cff** na raiz → GitHub mostra “Cite this repository”.
- **Zenodo + GitHub:** cada *release* gera um DOI (DOI de conceito para todas as versões + DOI por versão).
- **JOSS:** artigo curto (paper.md: resumo, *statement of need*, referências) + revisão aberta do **software**: licença OSI, instalação documentada, funcionalidade verificável, testes automatizados, documentação, diretrizes de contribuição, esforço acadêmico substancial.
- Outras opções: Bioinformatics (Application Notes), GigaScience, F1000.

### Código
```yaml
cff-version: 1.2.0
message: "Se usar este software, por favor cite-o como abaixo."
title: kmertools
version: 0.2.0
doi: 10.5281/zenodo.0000000
date-released: 2026-11-06
authors:
  - family-names: Sobrenome
    given-names: Nome
    orcid: https://orcid.org/0000-0000-0000-0000
license: MIT
repository-code: https://github.com/user/kmertools
```

### Armadilhas
- Citar o repositório sem versão (resultados não reprodutíveis).

@@ LEAD:0
> **O que esperar:** gerir projetos técnico-científicos — escopo, marcos, riscos e métodos ágeis adaptados à pesquisa. Base: PMBOK (conceitos), Scrum Guide, Kanban.

### Conceitos
- **Termo de abertura (charter):** objetivo, justificativa, entregáveis, escopo e **fora de escopo**, stakeholders, marcos, riscos, critérios de sucesso.
- **EAP/WBS:** quebrar entregáveis em pacotes de trabalho estimáveis.
- **Riscos:** probabilidade × impacto; resposta (evitar, mitigar, transferir, aceitar); dono e gatilho. Em ciência: dados atrasados, qualidade baixa, método não funciona.
- **Scrum:** sprints curtos, backlog priorizado, revisão e retrospectiva. **Kanban:** fluxo contínuo, colunas (A fazer → Fazendo → Revisão → Feito), **limite de WIP**, métricas de lead time.
- Pesquisa tem incerteza: use marcos de decisão (go/no-go) e *spikes* (investigações curtas com prazo).

### Quadro Kanban sugerido
Backlog · Pronto para começar · Fazendo (WIP ≤ 2) · Esperando dados/terceiros · Revisão · Feito

@@ LEAD:1
> **O que esperar:** estimar e priorizar demandas com critérios explícitos, considerando trade-offs e custo de oportunidade. Base: frameworks RICE, matriz impacto × esforço, MoSCoW.

### Conceitos
- **Impacto × esforço:** quick wins (alto/baixo) primeiro; grandes apostas planejadas; evite baixo impacto/alto esforço.
- **RICE** = (Reach × Impact × Confidence) / Effort.
- **MoSCoW:** Must, Should, Could, Won't (agora).
- **Custo de oportunidade:** dizer sim a X é dizer não a Y.
- **Estimativas:** em faixas (otimista/provável/pessimista; PERT = (O + 4M + P)/6), quebrar tarefas, comparar com histórico, incluir revisão/testes/documentação; incerteza alta → *spike*.
- Tornar a priorização **visível e justificada** para os solicitantes.

### Exemplo RICE
| Demanda | Reach | Impact | Conf. | Esforço | RICE |
|---|---|---|---|---|---|
| Automatizar QC | 40 amostras/sem | 2 | 80% | 2 sem | 32 |
| Dashboard novo | 5 pessoas | 1 | 50% | 4 sem | 0,6 |

@@ LEAD:2
> **O que esperar:** ferramentas para decidir e resolver problemas de forma estruturada. Base: Kahneman/Klein (pre-mortem), práticas de post-mortem sem culpa (Google SRE).

### Conceitos
- **Defina o problema** antes de soluções (o que, onde, quando, impacto, o que não é).
- **5 porquês:** perguntar “por quê” até a causa raiz de processo (não parar em “erro humano”).
- **Diagrama de Ishikawa:** causas por categoria (pessoas, método, máquina, material, medida, ambiente).
- **Pre-mortem:** “é daqui a 6 meses e o projeto falhou — por quê?” → riscos antes de começar.
- **Árvore de decisão / valor esperado** para escolhas sob incerteza.
- **Decisões reversíveis (porta de duas vias)** → rápidas e delegadas; **irreversíveis (uma via)** → cuidado, dados, consulta.
- **Post-mortem sem culpa:** linha do tempo, impacto, causas contribuintes, o que funcionou, ações (com dono e prazo).

### Modelo de post-mortem
Resumo · Impacto · Linha do tempo · Causas raiz e contribuintes · O que deu certo · O que deu errado · Onde tivemos sorte · Ações (dono, prazo)

@@ LEAD:3
> **O que esperar:** o que um líder técnico (staff/lead) faz — direção técnica, delegação, mentoria, feedback e segurança psicológica. Base: Larson “Staff Engineer”, Fournier “The Manager's Path”, Edmondson (segurança psicológica).

### Conceitos
- **Arquétipos staff:** tech lead (guia uma equipe), arquiteto (direção técnica de uma área), *solver* (problemas difíceis), *right hand* (estende a liderança).
- **Influência sem autoridade:** escrever (design docs, ADRs), construir consenso, ser o exemplo técnico, conectar pessoas.
- **Delegação:** delegar resultados (o quê e por quê), não passos; nível de autonomia explícito; apoiar sem tomar de volta.
- **Mentoria:** objetivos da pessoa, plano com marcos, *pair programming*, revisões que ensinam, dar visibilidade.
- **Feedback** (modelo SBI): Situação, Comportamento, Impacto — específico, oportuno, privado quando corretivo.
- **Segurança psicológica:** a equipe pode errar, perguntar e discordar sem punição → base para alto desempenho e qualidade.

### Plano de mentoria 3 meses (esqueleto)
- Mês 1: ambiente, boas práticas, 1 tarefa guiada · Mês 2: análise própria com revisão · Mês 3: entrega autônoma + apresentação · Encontros 1:1 semanais, metas revisadas mensalmente

@@ LEAD:4
> **O que esperar:** trabalhar com stakeholders, negociar e mostrar o valor de negócio da bioinformática. Base: mapa de stakeholders (poder × interesse), Fisher & Ury “Getting to Yes”.

### Conceitos
- **Mapa poder × interesse:** gerenciar de perto (alto/alto), manter satisfeito (alto poder), manter informado (alto interesse), monitorar.
- **Comunicação com gestão:** comece pela conclusão e pela decisão pedida (BLUF), números de impacto (tempo, custo, receita, risco), opções com trade-offs, sem jargão.
- **Valor/ROI de análises:** horas economizadas, custo evitado (reprocessamento, reagentes), novas receitas (serviço novo), redução de risco regulatório, tempo até resultado.
- **Negociação (Harvard):** separar pessoas do problema, focar em **interesses** (não posições), gerar opções, critérios objetivos, conhecer sua **BATNA**.

### One-pager executivo (modelo)
Problema/oportunidade · Proposta · Benefícios (com números) · Custos e prazo · Riscos e mitigação · Decisão pedida

@@ LEAD:5
> **O que esperar:** questões éticas em genômica — consentimento, achados incidentais, autoria, conflitos de interesse e integridade. Base: recomendações ACMG (achados secundários), Declaração de Helsinque, ICMJE (autoria), resoluções CNS/CEP.

### Conceitos
- **Consentimento informado:** finalidade, riscos (reidentificação), compartilhamento, retorno de resultados, direito de retirada; consentimento amplo × específico.
- **Achados incidentais/secundários:** ACMG SF (lista de genes acionáveis — ex.: BRCA1/2, genes de síndrome de Lynch, cardiomiopatias) para oferecer ao paciente que optou; ética de pesquisa (o que foi consentido?), confirmação em laboratório clínico, aconselhamento genético.
- **Autoria (ICMJE):** contribuição substancial + redação/revisão + aprovação final + responsabilidade; bioinformata que fez a análise merece autoria; evitar autoria honorária.
- **Conflitos de interesse:** declarar financiamentos e vínculos.
- **Integridade:** sem fabricação, falsificação ou plágio; não fazer p-hacking; reportar erros e corrigir (errata).
- Equidade: diversidade de ancestralidades nos dados e acesso aos benefícios.

### Armadilhas
- Devolver um achado de pesquisa sem confirmação clínica nem aconselhamento.

@@ CAR:0
> **O que esperar:** ler vagas com método e mapear o que você já prova ter × o que falta. Base: pesquisa de vagas do site (página Mercado) e o mapa competência → módulo.

### Conceitos
- Separe nas vagas: **obrigatórios** × **desejáveis**; **hard skills** (linguagens, pipelines, nuvem, ômicas) × **soft** (comunicação, liderança); sinais de nível (autonomia, “desenhar/liderar” = sênior).
- **Matriz competência × evidência:** para cada competência, a **prova** (repositório, artigo, projeto, certificação, resultado no trabalho) e o nível (0–3).
- Lacunas recorrentes em ≥ 30% das vagas → prioridade de estudo/projeto.
- Termos que se repetem viram palavras-chave do currículo/LinkedIn (sem exagerar).

### Template
| Competência | Freq. nas vagas | Evidência que tenho | Nível (0–3) | Próximo passo |
|---|---|---|---|---|
| Nextflow | 7/10 | pipeline RNA-seq no GitHub | 2 | módulo nf-core + nf-test |

@@ CAR:1
> **O que esperar:** montar um portfólio que mostra competência — GitHub, site pessoal, estudos de caso, publicações e LinkedIn. Base: guias de portfólio para cientistas de dados/bioinformatas, Quarto websites.

### Conceitos
- **3–5 projetos-vitrine** > 30 repositórios inacabados. Cada um: README excelente (problema, dados, como rodar, resultados com figura, limitações), código limpo, testes/CI, ambiente reprodutível.
- **Estudo de caso** (1 página): contexto → desafio → o que você fez (decisões e trade-offs) → resultado (números) → o que aprendeu.
- **GitHub:** README de perfil, repositórios fixados, commits consistentes.
- **Site pessoal (Quarto):** sobre, projetos, publicações, blog técnico curto, CV.
- **LinkedIn:** título com foco (ex.: “Bioinformata | NGS, pipelines Nextflow, microbioma”), resumo com resultados, links para os projetos.

### Código
```bash
quarto create project website meu-site && cd meu-site && quarto preview
quarto publish gh-pages
```

### Armadilhas
- Projetos de tutorial copiados sem pergunta própria nem decisões explicadas.

@@ CAR:2
> **O que esperar:** os formatos de entrevista técnica — live coding, take-home, casos de análise e system design de plataformas de dados. Base: guias de entrevista técnica e system design, prática em Rosalind.

### Conceitos
- **Live coding:** pense em voz alta, esclareça requisitos, comece pelo simples, teste com exemplos, discuta complexidade. Problemas típicos: parsing de FASTA/GFF, k-mers, intervalos sobrepostos, reverse complement, dicionários/sets.
- **Take-home:** entregue como produto — README, ambiente, scripts reprodutíveis, QC, decisões justificadas, limitações; respeite o tempo.
- **Caso de análise:** pergunta → desenho → QC → método → interpretação → riscos/confundidores.
- **System design (ex.: 10 mil exomas):** requisitos (volume, latência, conformidade), ingestão (de FASTQ ao armazenamento), orquestração (Nextflow + Batch/HPC), armazenamento (objetos + Parquet/VCF/GenomicsDB), metadados/LIMS, QC e monitoramento, custos (spot, tiers), segurança (IAM, criptografia, LGPD), reprocessamento e versionamento.

### Estimativa rápida (10 mil exomas)
- ~6–10 GB FASTQ por exoma → ~100 TB brutos; CRAM reduz BAM ~50%; ~1–2 h de CPU×32 por amostra.

@@ CAR:3
> **O que esperar:** responder perguntas comportamentais com histórias STAR e negociar oferta. Base: método STAR, guias de negociação salarial.

### Conceitos
- **STAR:** **S**ituação (contexto curto), **T**arefa (seu papel/objetivo), **A**ção (o que **você** fez — maior parte), **R**esultado (número, impacto, aprendizado).
- Banco de 8–10 histórias reutilizáveis: liderança, conflito, falha, prazo apertado, decisão com dados incompletos, influência sem autoridade, mentoria, erro técnico corrigido.
- Para “falha”: assuma, mostre o que aprendeu e o que mudou.
- **Negociação:** pesquise faixas (Glassdoor, levels, comunidades), deixe a empresa falar o número primeiro quando possível, negocie o pacote total (salário, bônus, remoto, educação, equipamento), peça por escrito, seja cordial e específico.

### Template STAR
- S: “No projeto X, o pipeline levava 3 dias por lote…”
- T: “Eu era responsável por…”
- A: “Perfilei, identifiquei…, propus…, implementei…, alinhei com…”
- R: “Tempo caiu para 6 h; liberou 2 dias/semana da equipe; virou padrão.”

@@ CAR:4
> **O que esperar:** manter-se atualizado e visível — rotina de leitura, comunidades, conferências e contribuições open source. Base: comunidades de bioinformática (Biostars, nf-core Slack, Bioconductor, RSG Brasil/ISCB).

### Conceitos
- **Rotina:** 1–2 artigos/semana com ficha curta; alertas (Google Scholar, PubMed, bioRxiv por palavra-chave); newsletters e blogs técnicos.
- **Comunidades:** Biostars, nf-core e Snakemake (Slack), Bioconductor (Slack/support), RSG-Brasil, ISCB, BOSC; grupos locais.
- **Conferências:** ISMB/ECCB, X-Meeting (Brasil), BOSC, Nextflow Summit, Bioc conference — apresente posters/talks.
- **Open source:** comece por issues “good first issue”, documentação, testes, reprodução de bugs; siga o CONTRIBUTING; PRs pequenos.
- **Ensinar** (blog, workshops, Carpentries) consolida o aprendizado e dá visibilidade.

### Primeira contribuição (passo a passo)
1. Escolha projeto que você usa · 2. Leia CONTRIBUTING e código de conduta · 3. Reproduza a issue · 4. Fork + branch + teste · 5. PR pequeno, descrição clara · 6. Responda à revisão
