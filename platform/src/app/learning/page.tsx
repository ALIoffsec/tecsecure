import { LearningCatalog } from "@/components/learning-catalog";
import { MyLearning } from "@/components/my-learning";
import { getCurrentUser } from "@/lib/auth";
import { myLearningData } from "@/lib/learning-profile-server";
import { pageMetadata } from "@/lib/structured-data";

export const dynamic = "force-dynamic";

export const metadata = pageMetadata({
  path: "/learning",
  title: "IT va kiberxavfsizlik kurslari — amaliy ta’lim",
  description: "Linux, tarmoq va kiberxavfsizlik bo‘yicha amaliy kurslar: darslar, laboratoriyalar, imtihonlar va CTF mashqlari. O‘zbek tilida, o‘z tezligingizda."
});

/** A signed-in learner lands on "My learning"; a guest sees the learning catalogue. */
export default async function LearningPage() {
  const user = await getCurrentUser();
  if (user && user.role === "CUSTOMER") return <MyLearning data={await myLearningData(user.id)} />;
  return <LearningCatalog section="overview" />;
}
