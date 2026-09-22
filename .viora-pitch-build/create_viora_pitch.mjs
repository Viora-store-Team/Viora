import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { Presentation, PresentationFile } from "@oai/artifact-tool";

const SKILL_DIR = "C:\\Users\\hp\\.codex\\plugins\\cache\\openai-primary-runtime\\presentations\\26.909.12148\\skills\\presentations";
const workspaceDir = "C:\\Users\\hp\\Desktop\\Viora";
const TMP_DIR = "C:\\Users\\hp\\Desktop\\Viora\\.viora-pitch-build";
const FINAL_PPTX = "C:\\Users\\hp\\Desktop\\Viora\\presentation-output\\Viora-Platform-Pitch-2026-v2.pptx";
const RUNTIME_PYTHON = "C:\\Users\\hp\\.cache\\codex-runtimes\\codex-primary-runtime\\dependencies\\python\\python.exe";
const logoPath = path.join(workspaceDir, "public", "viora-mark.png");

const { resolvePresentationFont, finalizePresentation } = await import(
  pathToFileURL(path.join(SKILL_DIR, "container_tools", "artifact_tool_utils.mjs")).href,
);
const font = resolvePresentationFont();
const logoBytes = await fs.readFile(logoPath);
await fs.mkdir(TMP_DIR, { recursive: true });
await fs.mkdir(path.dirname(FINAL_PPTX), { recursive: true });

const C = {
  ink: "#231A18",
  burgundy: "#7E182A",
  burgundyDark: "#4D0B17",
  wine: "#9A3040",
  cream: "#FBF8F3",
  warm: "#F3EAE3",
  sand: "#E8D8CB",
  muted: "#786B65",
  line: "#E7DDD3",
  white: "#FFFFFF",
};

const p = Presentation.create({ slideSize: { width: 1280, height: 720 } });

function rect(slide, left, top, width, height, fill, radius = 0, line = "none") {
  return slide.shapes.add({
    geometry: radius ? "roundRect" : "rect",
    position: { left, top, width, height },
    fill,
    line: line === "none" ? { fill: "none", width: 0 } : { style: "solid", fill: line, width: 1 },
    ...(radius ? { borderRadius: radius } : {}),
  });
}

function text(slide, value, left, top, width, height, {
  size = 24, color = C.ink, bold = false, align = "right", valign = "middle", name,
} = {}) {
  const shape = slide.shapes.add({
    geometry: "textbox",
    name,
    position: { left, top, width, height },
    fill: "none",
    line: { fill: "none", width: 0 },
  });
  shape.text = value;
  shape.text.style = {
    typeface: font,
    fontSize: size,
    color,
    bold,
    alignment: align,
    verticalAlignment: valign,
    autoFit: "shrinkText",
  };
  return shape;
}

function divider(slide, left, top, width, color = C.line) {
  slide.shapes.add({
    geometry: "line",
    position: { left, top, width, height: 0 },
    fill: "none",
    line: { style: "solid", fill: color, width: 1 },
  });
}

function brandFooter(slide, n, dark = false) {
  const color = dark ? "#EED9D4" : C.muted;
  text(slide, "VIORA", 72, 670, 120, 24, { size: 16, color, bold: true, align: "left" });
  text(slide, String(n).padStart(2, "0"), 1114, 670, 94, 24, { size: 15, color, align: "right" });
}

// 1. Cover
{
  const s = p.slides.add();
  s.background.fill = C.burgundyDark;
  rect(s, 0, 0, 1280, 720, C.burgundyDark);
  rect(s, 0, 0, 430, 720, C.burgundy);
  rect(s, 66, 100, 4, 320, "#D6A5A7");
  rect(s, 104, 140, 222, 245, C.cream, 24);
  s.images.add({
    blob: logoBytes,
    contentType: "image/png",
    alt: "شعار منصة فيورا",
    fit: "contain",
    position: { left: 128, top: 162, width: 174, height: 200 },
  });
  text(s, "فيورا", 520, 170, 610, 82, { size: 62, color: C.white, bold: true });
  text(s, "منصة موحّدة لاكتشاف وشراء الأزياء\nمن المتاجر المحلية", 520, 270, 610, 116, { size: 31, color: "#F6E9E4" });
  divider(s, 520, 430, 360, "#B95B66");
  text(s, "عرض فكرة المشروع  |  3–4 دقائق", 520, 454, 390, 36, { size: 19, color: "#E5C9C8" });
  text(s, "من تجربة متاجر متفرّقة إلى رحلة شراء واضحة", 520, 555, 610, 40, { size: 21, color: "#F3D8D5", bold: true });
  brandFooter(s, 1, true);
  s.speakerNotes.textFrame.setText("10 ثوانٍ. فيورا منصة عربية تجمع منتجات الأزياء والمتاجر المحلية في مكان واحد. سنعرض المشكلة، الحل، نموذج الاستدامة، ما أنجزناه، وخطوتنا القادمة.");
}

// 2. Problem
{
  const s = p.slides.add();
  s.background.fill = C.cream;
  text(s, "المشكلة", 84, 58, 1100, 56, { size: 42, bold: true });
  text(s, "رحلة شراء الأزياء المحلية ما زالت موزّعة بين حسابات ورسائل متفرقة.", 84, 132, 1060, 44, { size: 25, color: C.muted });
  divider(s, 84, 205, 1112);
  text(s, "المشتري", 945, 258, 230, 42, { size: 24, color: C.burgundy, bold: true });
  text(s, "يقارن بصعوبة بين المنتجات\nولا يملك مكانًا واضحًا للطلب والمتابعة.", 785, 315, 390, 100, { size: 27, color: C.ink });
  text(s, "المتجر", 515, 258, 210, 42, { size: 24, color: C.burgundy, bold: true });
  text(s, "يعرض منتجاته عبر قنوات متفرقة\nويحتاج طريقة منظمة لإدارة الطلبات.", 370, 315, 355, 100, { size: 27, color: C.ink });
  text(s, "النتيجة", 105, 258, 180, 42, { size: 24, color: C.burgundy, bold: true });
  text(s, "تجربة أقل وضوحًا للمشتري\nوفرصة وصول أضعف للمتاجر المحلية.", 84, 315, 300, 100, { size: 27, color: C.ink });
  rect(s, 84, 515, 1112, 1, C.line);
  text(s, "المشكلة الحقيقية: غياب واجهة واحدة تربط الاكتشاف بالطلب ومتابعة الحالة.", 84, 555, 1112, 46, { size: 27, color: C.burgundy, bold: true });
  brandFooter(s, 2);
  s.speakerNotes.textFrame.setText("25 ثانية. كثير من المتاجر المحلية تعرض منتجاتها عبر قنوات متفرقة. المشتري ينتقل بين الحسابات والرسائل، ويصعب عليه المقارنة والطلب ومتابعة ما طلبه. وفي المقابل، يحتاج المتجر قناة منظمة تصل إلى عملاء جدد وتوضح حالة الطلب.");
}

// 3. Solution
{
  const s = p.slides.add();
  s.background.fill = C.cream;
  text(s, "الحل", 84, 58, 1112, 56, { size: 42, bold: true });
  text(s, "فيورا تجمع المتاجر والمنتجات في تجربة عربية واحدة من البحث حتى متابعة الطلب.", 84, 128, 1112, 42, { size: 24, color: C.muted });
  rect(s, 84, 220, 1112, 2, C.sand);
  const steps = [
    ["01", "اكتشف", "متاجر ومنتجات\nوتصنيفات واضحة"],
    ["02", "اختَر", "بحث وفلترة\nومفضلة شخصية"],
    ["03", "اطلب", "سلة وعناوين\nودفع عند الاستلام"],
    ["04", "تابع", "طلبات وإشعارات\nوتفاصيل كل طلب"],
  ];
  steps.forEach((step, i) => {
    const left = 84 + i * 278;
    text(s, step[0], left, 258, 72, 30, { size: 16, color: C.wine, bold: true, align: "left" });
    text(s, step[1], left, 305, 210, 46, { size: 29, color: C.ink, bold: true, align: "left" });
    text(s, step[2], left, 370, 230, 70, { size: 21, color: C.muted, align: "left" });
    if (i < 3) divider(s, left + 245, 330, 30, C.burgundy);
  });
  rect(s, 84, 525, 1112, 92, C.warm, 16);
  text(s, "للعميل: رحلة شراء واضحة. للمتجر: واجهة لعرض المنتجات وتحديث حالة الطلب.", 120, 545, 1040, 48, { size: 25, color: C.burgundy, bold: true });
  brandFooter(s, 3);
  s.speakerNotes.textFrame.setText("35 ثانية. فيورا تقدم رحلة واحدة: المستخدم يكتشف، يختار، يطلب ثم يتابع. جمعنا البحث والفلترة والمفضلة والسلة والعناوين والطلبات والإشعارات في تجربة عربية متناسقة. ويستفيد المتجر من واجهة منظمة لعرض المنتجات وإدارة حالة الطلب.");
}

// 4. Market and business model
{
  const s = p.slides.add();
  s.background.fill = C.cream;
  text(s, "السوق ونموذج الاستدامة", 84, 58, 1112, 56, { size: 42, bold: true });
  text(s, "نبدأ من احتياج واضح لدى المتسوقين والمتاجر المحلية في قطاع الأزياء.", 84, 128, 1112, 40, { size: 24, color: C.muted });
  divider(s, 84, 205, 1112);
  text(s, "المستخدمون المستهدفون", 712, 250, 470, 38, { size: 27, color: C.burgundy, bold: true });
  text(s, "المتسوقون", 895, 323, 285, 34, { size: 24, bold: true });
  text(s, "يبحثون عن أزياء ومنتجات محلية\nضمن تجربة عربية سهلة وواضحة.", 712, 365, 468, 80, { size: 23, color: C.muted });
  text(s, "أصحاب المتاجر", 895, 485, 285, 34, { size: 24, bold: true });
  text(s, "متاجر الملابس والإكسسوارات والعطور\nالتي تريد وصولًا رقميًا منظمًا.", 712, 527, 468, 80, { size: 23, color: C.muted });
  rect(s, 625, 245, 1, 370, C.line);
  text(s, "مصادر الدخل المقترحة", 88, 250, 470, 38, { size: 27, color: C.burgundy, bold: true });
  text(s, "عمولة على الطلبات المكتملة", 88, 330, 470, 35, { size: 24, bold: true });
  text(s, "ترتبط الإيرادات بعمليات بيع حقيقية عبر المنصة.", 88, 373, 470, 38, { size: 20, color: C.muted });
  text(s, "ظهور مميّز للمتاجر", 88, 456, 470, 35, { size: 24, bold: true });
  text(s, "مساحات مدفوعة لعرض متجر أو منتجاته أمام جمهور أكبر.", 88, 499, 470, 48, { size: 20, color: C.muted });
  text(s, "خدمات للمتاجر لاحقًا", 88, 585, 470, 35, { size: 24, bold: true });
  text(s, "أدوات إضافية لإدارة العرض وتحليل الأداء عند نضج المنصة.", 88, 628, 470, 34, { size: 19, color: C.muted });
  brandFooter(s, 4);
  s.speakerNotes.textFrame.setText("55 ثانية. نستهدف جهتين: المتسوق الذي يريد اكتشاف منتجات الأزياء المحلية وطلبها بوضوح، وصاحب المتجر الذي يريد قناة رقمية منظمة. نموذج الدخل المقترح يبدأ بعمولة على الطلبات المكتملة، ثم ظهور مميز للمتاجر، ومع نمو الاستخدام يمكن إضافة خدمات تساعد المتاجر في الإدارة وفهم الأداء. هذه مسارات مقترحة وليست إيرادات محققة بعد.");
}

// 5. Progress
{
  const s = p.slides.add();
  s.background.fill = C.cream;
  text(s, "الإنجاز حتى الآن", 84, 58, 1112, 56, { size: 42, bold: true });
  text(s, "تحويل الفكرة إلى واجهة عميل متكاملة ومتصلة بواجهات API.", 84, 128, 1112, 40, { size: 24, color: C.muted });
  rect(s, 180, 210, 3, 380, C.burgundy);
  const milestones = [
    ["هوية وتجربة عربية", "واجهة RTL متجاوبة وهوية برغندية موحّدة."],
    ["اكتشاف المنتجات والمتاجر", "تصنيفات، بحث، فلترة، صفحات قوائم وتفاصيل."],
    ["رحلة العميل", "تسجيل دخول، مفضلة، سلة، عناوين، وطلب عند الاستلام."],
    ["بعد الطلب", "ملف شخصي، سجل طلبات، تفاصيل الطلب وإشعارات."],
  ];
  milestones.forEach((m, i) => {
    const top = 210 + i * 95;
    rect(s, 163, top + 9, 38, 38, C.burgundy, 19);
    text(s, String(i + 1), 163, top + 9, 38, 38, { size: 17, color: C.white, bold: true, align: "center" });
    text(s, m[0], 250, top, 850, 35, { size: 26, color: C.ink, bold: true });
    text(s, m[1], 250, top + 42, 850, 31, { size: 20, color: C.muted });
  });
  rect(s, 84, 620, 1112, 1, C.line);
  text(s, "العمل الحالي يربط الواجهات الأمامية بخدمات المنصة ويغطي المسار الأساسي للمشتري.", 84, 638, 1112, 36, { size: 22, color: C.burgundy, bold: true });
  brandFooter(s, 5);
  s.speakerNotes.textFrame.setText("55 ثانية. أنجزنا واجهة عميل مبنية بـ Next.js ومتصلة بواجهات API. جهزنا تجربة عربية متجاوبة، ثم قوائم المنتجات والمتاجر مع البحث والفلترة والتصنيفات. أضفنا رحلة المستخدم من الدخول والمفضلة والسلة والعنوان حتى الطلب عند الاستلام. كما جهزنا الملف الشخصي وسجل الطلبات وتفاصيل كل طلب والإشعارات.");
}

// 6. Vision
{
  const s = p.slides.add();
  s.background.fill = C.burgundyDark;
  text(s, "الرؤية والخطوة التالية", 84, 68, 1112, 60, { size: 42, color: C.white, bold: true });
  text(s, "نريد أن تصبح فيورا نقطة البداية للتسوق من المتاجر المحلية بثقة ووضوح.", 84, 144, 1112, 42, { size: 24, color: "#F0D9D5" });
  rect(s, 84, 238, 1112, 2, "#A44B55");
  text(s, "إطلاق تجريبي", 84, 285, 300, 38, { size: 27, color: "#F3C7C4", bold: true, align: "left" });
  text(s, "ضم مجموعة مختارة من المتاجر\nوقياس رحلة الشراء الفعلية.", 84, 340, 300, 80, { size: 23, color: C.white, align: "left" });
  text(s, "تحسين التشغيل", 490, 285, 300, 38, { size: 27, color: "#F3C7C4", bold: true, align: "left" });
  text(s, "تحسين تفاصيل إدارة الطلب\nوالتوصيل بناءً على التجربة.", 490, 340, 300, 80, { size: 23, color: C.white, align: "left" });
  text(s, "توسع محسوب", 896, 285, 300, 38, { size: 27, color: "#F3C7C4", bold: true, align: "left" });
  text(s, "توسيع المتاجر والتصنيفات\nوتطوير شراكات دفع وتوصيل.", 896, 340, 300, 80, { size: 23, color: C.white, align: "left" });
  text(s, "فيورا تبدأ من احتياج يومي بسيط، ثم تبني سوقًا محليًا منظمًا حوله.", 84, 545, 1112, 46, { size: 29, color: "#F6E9E4", bold: true });
  brandFooter(s, 6, true);
  s.speakerNotes.textFrame.setText("25 ثانية. الخطوة التالية هي إطلاق تجريبي مع مجموعة مختارة من المتاجر، ثم قياس تجربة الشراء وتحسين إدارة الطلب والتوصيل بناءً على الاستخدام الحقيقي. بعد ذلك نتوسع تدريجيًا في المتاجر والتصنيفات والشراكات. رؤيتنا أن تصبح فيورا نقطة بداية موثوقة للتسوق من المتاجر المحلية.");
}

const candidatePath = path.join(TMP_DIR, "candidate-viora-pitch.pptx");
await (await PresentationFile.exportPptx(p)).save(candidatePath);

for (let i = 0; i < p.slides.length; i += 1) {
  const png = await p.export({ slide: p.slides.get(i), format: "png", scale: 1.25 });
  await fs.writeFile(path.join(TMP_DIR, `slide-${i + 1}.png`), new Uint8Array(await png.arrayBuffer()));
}
const montage = await p.export({ format: "webp", montage: true, scale: 1 });
await fs.writeFile(path.join(TMP_DIR, "montage.webp"), new Uint8Array(await montage.arrayBuffer()));

const requirements = {
  explicitTotalSlideCount: 6,
  requiredNativeTableOwnerSlides: [],
  requiredNativeChartOwnerSlides: [],
};
const fontPolicy = { basis: "design", families: [font] };
const result = await finalizePresentation({
  ...requirements,
  workspaceDir,
  candidatePath,
  finalPath: FINAL_PPTX,
  pythonExecutable: RUNTIME_PYTHON,
  integrityValidatorPath: path.join(SKILL_DIR, "container_tools", "inspect_presentation_package_integrity.py"),
  layoutValidatorPath: path.join(SKILL_DIR, "container_tools", "inspect_presentation_layout_geometry.py"),
  layoutArgs: ["--expected-slide-size-emu", "12192000,6858000", "--validate-bullet-geometry", "--validate-heading-fit"],
  requiredNativeTableOwnerSlides: [],
  fontPolicy,
  verifyArtifactToolImport: true,
  receiptPath: path.join(TMP_DIR, "Viora-Platform-Pitch-2026-v2.validation.json"),
});
console.log(JSON.stringify({ finalPath: FINAL_PPTX, font, result }, null, 2));
