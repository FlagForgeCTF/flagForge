import PageTitle from "@/components/PageTitle";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context";
import { Link } from "react-router-dom";

export default function Home() {
  const { authenticated } = useAuth();
  return (
    <>
      <PageTitle title="Flagforge" />
      <div className="px-12 py-4 w-full flex flex-col gap-12 max-xs:px-6 max-w-screen-2xl mx-auto">
        <div className="py-8 max-w-screen-lg mx-auto flex flex-col items-center gap-8">
          <div className="flex flex-col gap-5 max-xs:gap-12 max-sm:gap-12">
            <h1 className="text-center text-5xl max-sm:text-4xl max-xs:text-3xl tracking-tight leading-snug font-bold text-gray-600">
              Welcome to <span className="text-primary">flagforge</span> Capture
              The Flag (CTF) playground!🏆
            </h1>
            <p className="text-center max-xs:text-start font-medium leading-relaxed text-base">
              <span className="text-primary font-bold">flagforge</span> is a
              dynamic and engaging CTF platform dedicated to promoting{" "}
              <span className="text-primary font-bold">Cybersecurity</span>{" "}
              awareness and fostering a passion for coding among participants.
              Our CTF competition offers a challenging environment for
              individuals to test their skills in cybersecurity 🔒, cryptography
              🗝️, web exploitation 💻, reverse engineering 🔍, and other related
              fields.
            </p>
          </div>
          <Link
            to={authenticated ? "/problems" : "/login"}
            className="max-xs:w-full"
          >
            <Button
              className="font-bold tracking-tight text-base max-xs:w-full"
              size={"lg"}
            >
              Start Solving 🚀
            </Button>
          </Link>
        </div>

        <div className="flex gap-8 max-sm:gap-6 max-md:flex-col">
          <div className="w-full flex flex-col gap-3 border border-gray-300 px-6 rounded-lg py-6 bg-gray-50">
            <p className="text-xl font-extrabold tracking-tight">
              Innovative Challenges 🧿
            </p>
            <p className="font-medium text-gray-500">
              flagforge offers a variety of innovative challenges that test
              participants' creativity and problem-solving abilities, ensuring
              an engaging and rewarding experience for all.
            </p>
          </div>
          <div className="w-full flex flex-col gap-3 border border-gray-300 px-6 rounded-lg py-6 bg-gray-50">
            <p className="text-xl font-extrabold tracking-tight">
              Beginner-Friendly 🌐
            </p>
            <p className="font-medium text-gray-500">
              flagforge welcomes participants of all skill levels, including
              beginners. The platform offers challenges that cater to newcomers,
              providing a supportive environment for learning and growth.
            </p>
          </div>
          <div className="w-full flex flex-col gap-3 border border-gray-300 px-6 rounded-lg py-6 bg-gray-50">
            <p className="text-xl font-extrabold tracking-tight">
              Improvement 🎁
            </p>
            <p className="font-medium text-gray-500">
              flagforge regularly updates its challenges and platform based on
              feedback from participants, ensuring that the experience remains
              relevant and engaging.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
