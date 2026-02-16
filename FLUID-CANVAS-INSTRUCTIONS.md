# STUDIO GHOST — WebGPU流体シミュレーション実装指示書

## 目的

現在のフローフィールド・パーティクル（FluidBackground.tsx）を、WebGPU による本物の流体シミュレーションに置き換える。OJPPの `fluid-canvas.tsx` と同等の技術レベルを実現する。

## 対象ファイル

### 新規作成
- `E:\HUMAN\studio-ghost\components\FluidCanvas.tsx` — WebGPU流体シミュレーション

### 変更
- `E:\HUMAN\studio-ghost\components\Hero.tsx` — FluidBackground → FluidCanvas に差し替え
- `E:\HUMAN\studio-ghost\app\page.tsx` — FluidBackground の import を削除（Hero内で使用）

### 現状参照（削除または残す判断は任意）
- `E:\HUMAN\studio-ghost\components\FluidBackground.tsx` — 現在のCanvas 2Dパーティクル（フォールバック用に残してもOK）

## 技術仕様

### アーキテクチャ
- **WebGPU** (Compute Shader + Render Pipeline)
- **WGSL** (WebGPU Shading Language) でシェーダーを記述
- **WebGPU非対応ブラウザ**では既存のFluidBackground（Canvas 2D）にフォールバック

### シミュレーショングリッド
- 解像度: **256 x 256** セル
- バッファ:
  - 速度場 (velocity): `vec2f` × 2バッファ（ping-pong）
  - 染料場 (dye): `vec4f` × 2バッファ（ping-pong）
  - Uniform: `{ width, height, time, dt, mouseX, mouseY, mouseDX, mouseDY }` = 32 bytes
  - Render uniform: `{ width, height, time, pad }` = 16 bytes

### Compute Shader (WGSL) — 物理シミュレーション

```
Workgroup size: 8×8
Dispatches: 32×32 = 1024 workgroups
```

**処理フロー（1フレームごと）：**

1. **Semi-Lagrangian移流 (Advection)**
   - 現在位置から速度×dt×12 だけ戻った位置の速度・染料をサンプリング
   - 速度に0.995、染料に0.992の減衰（自然消散）

2. **カールノイズ乱流 (Curl Noise Turbulence)**
   - UV座標 × 6.0 のスケールでfbm（4オクターブ）→ curl計算
   - カールノイズ × 45.0 × 0.012 を速度場に加算
   - fbm: `noise2(q + t*0.3)` で時間依存

3. **ノイズベース染料注入 (Noise Dye Injection)**
   - UV × 4.0 + t × 0.15 でfbmを評価
   - 閾値 0.55 を超えた領域に染料を注入
   - 色相はtime + 座標で動的に変化

4. **マウスインタラクション**
   - 半径: 画面幅の18%
   - ガウシアン減衰: `exp(-d²/(r²×0.15))`
   - 速度注入: `mouseDirection × strength × 0.8`
   - 染料注入: `hsv(hue, 1, 1) × strength × 3.0`

5. **12個の虹色渦 (Orbiting Vortices)**
   - 0.524 radian 間隔で12個の渦が画面中心を周回
   - 各渦の半径: `画面幅 × (0.06 + j × 0.05)`
   - 角速度: `0.15 + j × 0.035`
   - 渦の影響半径: `画面幅 × 0.06`
   - 接線方向の速度注入: `strength × 90.0`
   - 色相: `j/12 + t × 0.05` で虹色サイクル

6. **3つのバースト放射源**
   - `sin(t × 0.3 + k × 2.094)` で周期的にバースト
   - バースト > 0.7 のとき放射
   - 半径: `画面幅 × 0.08`
   - 回転する方向に速度注入: `strength × 60.0`

7. **出力クランプ**: 染料を `[0, 3]` に制限

### ノイズ関数（WGSL内に実装）

```wgsl
// Hash noise
fn hash21(p: vec2f) -> f32
fn hash22(p: vec2f) -> vec2f

// Value noise (Hermite補間)
fn noise2(p: vec2f) -> f32

// Fractional Brownian Motion (4オクターブ)
fn fbm(p: vec2f, t: f32) -> f32

// Curl noise (fbmの偏微分)
fn curl(p: vec2f, t: f32) -> vec2f

// HSV→RGB変換
fn hsv(h: f32, s: f32, v: f32) -> vec3f
```

### Render Pipeline — ポストプロセス

Fragment Shaderで以下の視覚効果を適用:

1. **3×3シャープニングカーネル**
   - 中央: 0.40、十字: 0.10×4、対角: 0.05×4

2. **Sカーブコントラスト強調**
   - `c = c * 1.3`
   - `c = c * c * (3.0 - 2.0 * c)`

3. **色収差 (Chromatic Aberration)**
   - R/Bチャンネルを水平方向に `1.5/width` ずらす
   - 強度: 0.15

4. **フィルムグレイン**
   - Hash noise × 0.06

5. **ビネット**
   - `smoothstep(0.85, 0.1, distance_from_center)`

6. **アルファ出力**
   - `alpha = max(r, g, b) * 0.35` — 背景と半透明合成

### Render Pipeline 設定

```
Vertex: 4頂点の triangle-strip (フルスクリーンクアッド)
Blend: src-alpha, one-minus-src-alpha (premultiplied alpha)
Canvas format: navigator.gpu.getPreferredCanvasFormat()
Alpha mode: "premultiplied"
```

### Canvas設定
```
width = window.innerWidth * 0.5
height = window.innerHeight * 0.5
style: width: 100vw, height: 100vh
className: pointer-events-none fixed inset-0 z-[1]
```
※ 0.5倍解像度でレンダリングしてCSS 100vwにスケールアップ（パフォーマンス最適化）

## STUDIO GHOST カラーパレットへの調整

OJPPは虹色（全色相）を使うが、STUDIO GHOSTではゴースト的な色に合わせる:

- 渦の色相: シアン(180°)〜パープル(280°)の範囲に限定
  - `fract(j/12.0 + t*0.05)` → `0.5 + fract(j/12.0 + t*0.05) * 0.28` (= 180°〜280°)
- 染料注入の色: 同様にシアン〜パープル寄りにする
- マウスの染料: シアンメインで
- 全体的に彩度を少し落として（0.9 → 0.75）ゴースト感を出す

## WebGPU非対応フォールバック

```tsx
useEffect(() => {
  if (!navigator.gpu) {
    setFallback(true);
    return;
  }
  // ... WebGPU初期化
}, []);

if (fallback) return <FluidBackground />; // 既存のCanvas 2D版
return <canvas ref={ref} ... />;
```

## マウスイベント

- `mousemove`: 正規化座標(0-1)でマウス位置とデルタを追跡
- デルタは毎フレーム `*= 0.82` で減衰（慣性）
- `mouseleave`: 特別な処理不要（デルタが自然減衰）

## GPU リソースのライフサイクル

- `useEffect` の cleanup で:
  - `dead = true` フラグをセット
  - `cancelAnimationFrame` でアニメーションループ停止
  - `window.removeEventListener` でマウスイベント解除
  - ※ `device.destroy()` は呼ばなくてOK（ブラウザGCに任せる）
  - ※ adapter取得後に `dead` チェックを入れる（非同期初期化中のアンマウント対策）

## 既知の注意点

1. **WebGPUは2024年後半からChrome/Edge安定版で利用可能**。Safari/Firefoxは実験的サポート。
2. **`navigator.gpu` の存在チェック**を必ず行うこと（undefinedの可能性）
3. **TypeScript型**: `navigator.gpu` は `@webgpu/types` パッケージが必要な場合がある。`tsconfig.json` の `types` に `"@webgpu/types"` を追加するか、`// @ts-ignore` で回避。
4. **alphaMode: "premultiplied"** を使わないと背景透過が正しく動かない
5. OJPPのコードを**一切コピーしない**（AGPLライセンス回避）。この指示書に基づいてゼロから書くこと。

## 検証方法

1. `pnpm dev` でサイト起動
2. ブラウザのDevToolsコンソールで `navigator.gpu` が存在することを確認
3. Heroセクションの背景に流動的な色の動きが表示されること
4. マウスを動かすと染料が広がること
5. 渦が画面中心付近を周回していること
6. WebGPU非対応環境（Firefoxなど）で既存パーティクルにフォールバックすること
7. Playwrightでスクリーンショットを撮って確認（注: headless Chromiumの WebGPU サポートに注意。`--enable-unsafe-webgpu` フラグが必要な場合あり）

## GitHubリポジトリ

- URL: https://github.com/Torotorototoro/studio-ghost
- ブランチ: master
- 実装後にコミット＆プッシュすること
