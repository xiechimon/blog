---
illustration_id: 03
type: flowchart
style: notion
---

# RAG 五段式流程

LABELS (in priority, exact text on each step box):
1. 分块 (Chunking)
2. 向量化 (Embedding)
3. 检索 (Retrieval)
4. 融合 (Fusion)
5. 评估 (Evaluation)

Under each step (smaller italic text):
1. 段落 + 滑动窗口 10% 重叠
2. bge-large-zh-v1.5 1024 维
3. FAISS HNSW + BM25 并行
4. RRF + Cross-Encoder top-5
5. 200 条固定测试集 + Recall@5

LAYOUT: 16:9 canvas. Five rounded rectangle boxes arranged horizontally left to right, evenly spaced. Solid arrows between consecutive boxes. Each box has the main step label in bold at top, and the example text in smaller italic below. Arrows are thick (3px) and have small triangular heads. From left to right: 分块 → 向量化 → 检索 → 融合 → 评估. Boxes are roughly equal width. Centered vertically on canvas. Title at top: "RAG 五段式流程". Optional small note at bottom right: "标准命中率 Recall@5 / Precision@5 / 端到端延迟".

ZONES:
- Background: very light neutral cream (#FAF8F5)
- Box fills: alternating very subtle tones (white, very pale cream, white, very pale cream, white) to create visual rhythm
- Box outlines: dark gray (#2A2A2A), 1.5px, rounded corners (radius 8px)
- Box labels: bold dark gray (#1A1A1A)
- Sub-labels: medium gray (#666)
- Arrows: dark gray (#2A2A2A), thick with triangular heads

STYLE: Clean horizontal flow chart, no decoration beyond essential elements. Clear directional flow left to right. Boxes are simple rectangles with rounded corners. No icons or extra graphics inside boxes. No 3D effects.

Color values (#hex) and color names are rendering guidance only — do NOT display color names, hex codes, or palette labels as visible text in the image.

Clean composition with generous white space. Simple or no background. Main elements centered or positioned by content needs.

Text should be large and prominent with handwritten-style fonts. Keep minimal, focus on keywords.

ASPECT: 16:9
