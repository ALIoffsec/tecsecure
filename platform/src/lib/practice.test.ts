import assert from "node:assert/strict";
import test from "node:test";
import { getExam, gradeExam, learningExams, toPublicQuestions } from "./learning-exams";
import { getLab, isLabAnswerCorrect, learningLabs, toPublicLab } from "./learning-labs";
import { careerLearningLabs } from "./learning-career-labs";
import { getModule } from "./learning-demo";
import { examPriceFor, labPriceFor } from "./practice-perks";

test("labs have unique tasks, valid modules and no leaked answers in public view", () => {
  assert.equal(careerLearningLabs.length, 43);
  assert.equal(learningLabs.length, 60);
  for (const lab of learningLabs) {
    assert.ok(getModule(lab.moduleSlug), `module ${lab.moduleSlug}`);
    assert.ok(lab.tasks.length >= 4);
    assert.equal(new Set(lab.tasks.map((task) => task.id)).size, lab.tasks.length);
    for (const task of lab.tasks) assert.ok(task.answers.length > 0 && task.answers.some((answer) => isLabAnswerCorrect(task, answer)));
    assert.ok(!JSON.stringify(toPublicLab(lab)).includes('"answers"'));
  }
  const lab = getLab("ssh-bruteforce-auth-log");
  assert.ok(lab && !isLabAnswerCorrect(lab.tasks[0], "wrong answer"));
});

test("exam prerequisites reference real modules and labs; public questions hide answers", () => {
  for (const exam of learningExams) {
    assert.equal(exam.questions.length, 15);
    for (const slug of exam.requiredModules) assert.ok(getModule(slug), slug);
    for (const slug of exam.requiredLabs) assert.ok(getLab(slug), slug);
    assert.equal(new Set(exam.questions.map((question) => question.id)).size, 15);
    assert.ok(!JSON.stringify(toPublicQuestions(exam)).includes("correct"));
  }
});

test("exam grading passes at 70% and fails below", () => {
  const exam = getExam("tec-network-foundations")!;
  const perfect = Object.fromEntries(exam.questions.map((question) => [question.id, question.correct]));
  assert.deepEqual([gradeExam(exam, perfect).scorePercent, gradeExam(exam, perfect).passed], [100, true]);
  const wrong = (question: { correct: number }) => (question.correct + 1) % 4;
  const pass = Object.fromEntries(exam.questions.map((question, index) => [question.id, index < 11 ? question.correct : wrong(question)]));
  assert.equal(gradeExam(exam, pass).passed, true);
  const fail = Object.fromEntries(exam.questions.map((question, index) => [question.id, index < 10 ? question.correct : wrong(question)]));
  assert.equal(gradeExam(exam, fail).passed, false);
  assert.equal(gradeExam(exam, {}).scorePercent, 0);
});

test("plan perks adjust lab and exam prices", () => {
  assert.equal(labPriceFor(null, 20), 20);
  assert.equal(labPriceFor("basic", 20), 20);
  assert.equal(labPriceFor("standard", 20), 15);
  assert.equal(labPriceFor("expert", 20), 0);
  assert.equal(examPriceFor("standard", 100), 100);
  assert.equal(examPriceFor("expert", 100), 50);
});
