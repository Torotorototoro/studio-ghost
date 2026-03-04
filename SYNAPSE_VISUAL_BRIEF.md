# STUDIO GHOST — シナプスビジュアル実験

## ブランチ
`feature/synapse-visual`（`master` から分岐済み）

## 背景
STUDIO GHOST は「AI × 少数精鋭の一気通貫ビジネスコンサル」会社。
現在のサイト背景には **WebGPU Fluid Simulation**（Stable Fluids / Semi-Lagrangian Advection）が実装されている。

今回の実験: 流体シミュレーションを **人間のシナプス（神経回路）を模したビジュアル** に置き換える or 併用する。

## コンセプト
- **ノード** = パーティクル（少数精鋭のチームメンバーやAIを象徴）
- **シナプス接続** = ノード間を走る光の線（情報・知見のつながり）
- **発火** = マウスホバーやスクロールでノードが活性化し、接続線が光る
- **ダーク背景** = 現行の void 背景（`--sg-void: #020617`）をそのまま活用
- ブランドカラー: cyan（`#00E5FF`）、purple（`#B44AFF`）

## 技術スタック
- **フレームワーク**: Next.js 16.1.6 (Turbopack)
- **現行ビジュアル**: `components/FluidCanvas.tsx` — WebGPU Compute Shader (WGSL)
- **フォールバック**: `components/FluidBackground.tsx` — WebGPU非対応時のCSS/Canvas代替
- **シミュレーション解像度**: 256×256 グリッド
- **レンダリング**: 半解像度キャンバス → fullscreen quad で描画
- パッケージマネージャ: pnpm

## 実装方針

### アプローチ A: FluidCanvas を差し替え
- `components/SynapseCanvas.tsx` を新規作成
- `app/page.tsx` で FluidCanvas の代わりに SynapseCanvas を使用
- WebGPU Compute Shader でノード位置・接続を計算、Render Shader で描画

### アプローチ B: FluidCanvas と共存
- 流体の上にシナプスレイヤーを重ねる
- 流体 = 背景の空気感、シナプス = 前景の知性的な演出

### どちらでもいいが、以下は守る:
1. **WebGPU 優先、非対応時はフォールバック**（既存パターンに従う）
2. **マウスインタラクション必須** — カーソル付近のノードが発火・接続が強調
3. **パフォーマンス** — 60fps維持、モバイルでも動作
4. **ブランドカラー** — cyan/purple のグラデーション、aurora テキスト色との調和
5. **既存CSSクラスとの整合** — `glass-card`, `morph-blob`, `glow-cyan` 等

## ビジュアル参考
- Dopamine.AI の 3D 脳ノードアニメーション（Three.js + CSS3DRenderer）
- TensorSpace のニューラルネット3D可視化
- oimo.io の物理シミュレーション集
- Reaction-Diffusion Playground の有機的パターン生成

## 検証手順
1. `pnpm build` — ビルドエラーなし
2. `npx playwright test` — 既存テスト4件パス
3. ブラウザで目視確認（デスクトップ + モバイル幅）
4. 問題なければ `git push origin feature/synapse-visual`

## ファイル構成（参考）
```
components/
  FluidCanvas.tsx      ← 現行の流体（参考にする）
  FluidBackground.tsx  ← フォールバック（参考にする）
  SynapseCanvas.tsx    ← 新規作成
  Hero.tsx
  About.tsx
  Services.tsx
  ...
app/
  page.tsx             ← ここでビジュアルコンポーネントを切り替え
  layout.tsx
```

## 現行の FluidCanvas.tsx の構造（参考）
- Compute Shader: 速度場 + 染料場を256×256で計算
  - Semi-Lagrangian advection
  - Curl noise turbulence
  - 12個の周回渦 + 3個のバーストエミッター
  - マウス入力で速度場に力を加算
- Render Shader: fullscreen quad に染料をバイリニア補間で描画
  - S-curve コントラスト
  - 色収差
  - フィルムグレイン
  - ビネット
  - 輝度ベースのアルファ

この構造を参考に、シナプス版の Compute/Render シェーダーを設計すること。
