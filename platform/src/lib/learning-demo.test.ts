import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";
import { getPath, learningModules } from "./learning-demo";
import { firewallZeroToHeroDetails } from "./firewall-zero-to-hero-content";
import { firewallKerioTerminalExamples } from "./firewall-kerio-terminal-examples";
import { kerioControlDetails } from "./kerio-control-content";
import { learningTeachingChecks, learningTeachingVisuals } from "./learning-teaching-visuals";
import { networkFundamentalsDetails } from "./network-fundamentals-content";
import { freeLearningModules, modulePriceTec, sectionPriceTec } from "./learning-pricing";
import { toLearningModulePreview } from "./learning-catalog-data";
import { TEC_PRICE_MINOR, TEC_PRICE_UZS, tecPurchaseCostMinor } from "./tec-pricing";
import { moduleCompletionRewardTec } from "./learning-rewards";
import { getLearningSectionQuestion, isLearningAnswerCorrect } from "./learning-completion";

test("network fundamentals keeps rewritten lessons and screenshots on the site", () => {
  const module = learningModules.find((item) => item.slug === "network-fundamentals");
  assert.ok(module, "network fundamentals course exists");
  assert.equal(module.sections.length, 8);
  for (const [index, section] of module.sections.entries()) {
    const details = networkFundamentalsDetails[index];
    assert.ok(details, `lesson ${index + 1} has rewritten in-page material`);
    assert.ok(details.length > 500, `lesson ${index + 1} includes detailed explanations`);
    assert.match(details, /^### /m, `lesson ${index + 1} has readable topic headings`);
  }

  assert.equal(module.references, undefined, "network course has no source-download section");
  const assetDirectory = join(process.cwd(), "public", "learning-assets", "network-fundamentals");
  assert.deepEqual(readdirSync(assetDirectory).filter((name) => name.toLowerCase().endsWith(".pdf")), []);

  const screenshots = module.sections.flatMap((section) => section.images ?? []);
  assert.equal(screenshots.length, 7);
  for (const image of screenshots) {
    assert.ok(image.src.startsWith("/learning-assets/network-fundamentals/"));
    assert.ok(image.width > 0 && image.height > 0);
    assert.ok(image.alt.uz && image.caption.uz);
    const imagePath = join(process.cwd(), "public", image.src.slice(1));
    assert.ok(existsSync(imagePath), `screenshot exists: ${image.src}`);
    assert.equal(readFileSync(imagePath).subarray(0, 8).toString("hex"), "89504e470d0a1a0a");
  }
});

test("firewall and Kerio zero-to-hero courses are complete and discoverable", () => {
  const firewall = learningModules.find((item) => item.slug === "firewall-zero-to-hero");
  const kerio = learningModules.find((item) => item.slug === "kerio-control-zero-to-hero");
  assert.ok(firewall, "general firewall course exists");
  assert.ok(kerio, "Kerio Control course exists");
  assert.equal(firewall.sections.length, 14);
  assert.equal(kerio.sections.length, 11);

  for (const [module, details] of [
    [firewall, firewallZeroToHeroDetails],
    [kerio, kerioControlDetails]
  ] as const) {
    assert.equal(Object.keys(details).length, module.sections.length);
    for (const [index, section] of module.sections.entries()) {
      const lesson = details[index];
      assert.ok(lesson, `${module.slug} lesson ${index + 1} has full in-page content`);
      assert.ok(lesson.length > 350, `${module.slug} lesson ${index + 1} includes detailed explanations`);
      assert.match(lesson, /^### /m, `${module.slug} lesson ${index + 1} has topic headings`);
      assert.ok(section.title.uz, `${module.slug} lesson ${index + 1} has an Uzbek title`);
      const visual = learningTeachingVisuals[module.slug]?.[index];
      assert.ok(visual, `${module.slug} lesson ${index + 1} has an instructional diagram`);
      assert.equal(visual.nodes.length, 5, `${module.slug} lesson ${index + 1} diagram shows five stages`);
      assert.equal(visual.links.length, 4, `${module.slug} lesson ${index + 1} diagram connects every stage`);
      assert.ok(visual.caption.uz, `${module.slug} lesson ${index + 1} diagram explains what to notice`);
      const check = learningTeachingChecks[module.slug]?.[index];
      assert.ok(check, `${module.slug} lesson ${index + 1} has a self-check question`);
      assert.ok(check.answers.length > 0, `${module.slug} lesson ${index + 1} self-check has accepted answers`);
    }
  }

  for (const module of [firewall, kerio]) {
    const examples = firewallKerioTerminalExamples[module.slug];
    assert.ok(examples, `${module.slug} has terminal and lab examples`);
    assert.equal(examples.length, module.sections.length);
    for (const [index, item] of examples.entries()) {
      assert.ok(item.code.uz.length > 20, `${module.slug} lesson ${index + 1} has an actionable example`);
      assert.ok(item.explanation.uz.length > 80, `${module.slug} lesson ${index + 1} explains how to interpret the example`);
    }
    const images = module.sections.flatMap((section) => section.images ?? []);
    assert.ok(images.length > 0, `${module.slug} includes downloaded instructional images`);
    for (const image of images) {
      assert.ok(image.src.startsWith("/learning-assets/firewall-academy/"));
      assert.ok(image.caption.uz.toLowerCase().includes("pbroks13"));
      const imagePath = join(process.cwd(), "public", image.src.slice(1));
      assert.ok(existsSync(imagePath), `downloaded image exists: ${image.src}`);
      const bytes = readFileSync(imagePath);
      assert.equal(bytes.subarray(0, 8).toString("hex"), "89504e470d0a1a0a");
      assert.equal(bytes.readUInt32BE(16), image.width);
      assert.equal(bytes.readUInt32BE(20), image.height);
    }
  }

  assert.ok(firewallKerioTerminalExamples["firewall-zero-to-hero"][8].code.uz.includes("aws ec2"));
  assert.ok(firewallKerioTerminalExamples["firewall-zero-to-hero"][8].code.uz.includes("az network"));
  assert.ok(firewallKerioTerminalExamples["firewall-zero-to-hero"][8].code.uz.includes("gcloud"));
  assert.match(kerioControlDetails[0], /Kerio appliance’ining ichki shell’ida emas/);

  const firewallMaterial = Object.values(firewallZeroToHeroDetails).join("\n");
  for (const topic of ["Windows Defender Firewall", "nftables", "NGFW", "FortiGate", "pfSense", "Kubernetes", "WAF", "Cloud firewall", "ISP edge", "DDoS", "SIEM"]) {
    assert.ok(firewallMaterial.toLowerCase().includes(topic.toLowerCase()), `firewall course covers ${topic}`);
  }

  const kerioMaterial = Object.values(kerioControlDetails).join("\n");
  for (const topic of ["NAT", "DMZ", "web filter", "VPN", "backup", "Nosozlikni"]) {
    assert.ok(kerioMaterial.toLowerCase().includes(topic.toLowerCase()), `Kerio course covers ${topic}`);
  }

  const path = getPath("firewall-engineering-zero-to-hero");
  assert.ok(path, "firewall engineering path exists");
  assert.deepEqual(path.modules, ["network-fundamentals", "firewall-zero-to-hero", "kerio-control-zero-to-hero"]);
});

test("TEC pricing keeps starter content free and discounts full modules", () => {
  for (const slug of freeLearningModules) {
    const module = learningModules.find((item) => item.slug === slug);
    assert.ok(module, `free module ${slug} exists`);
    assert.equal(modulePriceTec(module), 0);
    assert.ok(module.sections.every((_, index) => sectionPriceTec(module, index) === 0));
  }

  for (const module of learningModules.filter((item) => !freeLearningModules.has(item.slug))) {
    assert.equal(sectionPriceTec(module, 0), 0, `${module.slug} includes a free first lesson`);
    const individualTotal = module.sections.reduce((sum, _, index) => sum + sectionPriceTec(module, index), 0);
    assert.ok(individualTotal > 0, `${module.slug} has priced lessons`);
    assert.ok(modulePriceTec(module) < individualTotal, `${module.slug} full module has a bundle discount`);
    assert.ok(Number.isInteger(modulePriceTec(module)) && modulePriceTec(module) > 0);
  }
});

test("network fundamentals starts TEC pricing from the third lesson", () => {
  const module = learningModules.find((item) => item.slug === "network-fundamentals");
  assert.ok(module);
  assert.equal(sectionPriceTec(module, 0), 0);
  assert.equal(sectionPriceTec(module, 1), 0);
  assert.ok(sectionPriceTec(module, 2) > 0);
  assert.ok(module.sections.slice(2).every((_, index) => sectionPriceTec(module, index + 2) > 0));
  assert.ok(modulePriceTec(module) > 0);
  assert.ok(modulePriceTec(module) < module.sections.slice(2).reduce((sum, _, index) => sum + sectionPriceTec(module, index + 2), 0));
});

test("learning module previews expose titles and pricing without lesson bodies", () => {
  const module = learningModules.find((item) => item.slug === "firewall-zero-to-hero");
  assert.ok(module);
  const preview = toLearningModulePreview(module);
  assert.deepEqual(preview.sections, module.sections.map(({ title }) => ({ title })));
  for (const section of preview.sections) {
    assert.equal("content" in section, false);
    assert.equal("images" in section, false);
    assert.equal("question" in section, false);
  }
  assert.equal("labPlan" in preview, true);
});

test("TEC cash purchases use the displayed UZS exchange rate", () => {
  assert.equal(TEC_PRICE_MINOR, TEC_PRICE_UZS * 100);
  assert.equal(tecPurchaseCostMinor(1) / 100, TEC_PRICE_UZS);
  assert.equal(tecPurchaseCostMinor(5) / 100, 50_000);
});

test("module completion awards one difficulty-scaled TEC reward", () => {
  const fundamental = learningModules.find((item) => item.slug === "network-fundamentals");
  const difficult = learningModules.find((item) => item.slug === "firewall-zero-to-hero");
  assert.ok(fundamental);
  assert.ok(difficult);
  assert.equal(moduleCompletionRewardTec(fundamental), 6);
  assert.equal(moduleCompletionRewardTec(difficult), 11);
  assert.equal(moduleCompletionRewardTec({ ...fundamental, difficulty: "hard" }), 16);
  const currentRewards = learningModules.map(moduleCompletionRewardTec);
  assert.equal(Math.min(...currentRewards), 5);
  assert.equal(Math.max(...currentRewards), 14);
});

test("server-side learning checks accept only configured answers", () => {
  for (const module of learningModules) {
    for (const [index, section] of module.sections.entries()) {
      assert.ok(getLearningSectionQuestion(module, index), `${module.slug} lesson ${index + 1} has a server-checked question`);
      assert.ok(section.title.uz);
    }
  }

  const firewall = learningModules.find((item) => item.slug === "firewall-zero-to-hero");
  assert.ok(firewall);
  const question = getLearningSectionQuestion(firewall, 0);
  assert.ok(question);
  assert.equal(isLearningAnswerCorrect(question.answers, "  HOST   FIREWALL "), true);
  assert.equal(isLearningAnswerCorrect(question.answers, "router"), false);
  assert.equal(isLearningAnswerCorrect(question.answers, " "), false);
  assert.equal(getLearningSectionQuestion(firewall, firewall.sections.length), undefined);
});
