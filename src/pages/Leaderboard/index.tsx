import { useGetLeaderboard } from "@/api/leaderboard";
import { Crown } from "lucide-react";

export default function Leaderboard() {
  const { data } = useGetLeaderboard();

  const getLevel = (score: number): string => {
    if (score < 200) return "[0x1][Newbie]";
    if (score < 500) return "[0x2][Scout]";
    if (score < 1000) return "[0x3][Codebreaker]";
    if (score < 1500) return "[0x4][Hacker]";
    if (score < 2000) return "[0x5][Cipher Hunter]";
    if (score < 3000) return "[0x6][Forger]";
    return "[0x7][Flag Conqueror]";
  };
  return (
    <>
      <div className="max-w-screen-2xl mx-auto w-full px-12 py-8 flex flex-col gap-12">
        <h1 className="w-full text-4xl font-bold text-primary tracking-tight">
          Leaderboard
        </h1>

        <div className="w-full max-screen-w-2xl p-4">
          {data?.data?.length === 0 ? (
            <p className="text-center text-gray-500">No data available</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {data?.data?.map(
                (
                  user: {
                    totalScore: number;
                    rank: number;
                    image: string;
                    name: string;
                  },
                  index: number
                ) => (
                  <div
                    className={`${index === 0 ? "col-span-full" : ""}`}
                    key={index}
                  >
                    {user.totalScore > 0 ? (
                      <div
                        className={`flex flex-col bg-gray-50 rounded-lg px-6 py-5 shadow-lg shadow-gray-100 relative overflow-clip border border-gray-200`}
                      >
                        <span className="text-xl font-bold text-primary absolute top-2 right-4">
                          #{index + 1}
                        </span>
                        <img
                          src={user.image || ""}
                          alt={`${user.name}'s avatar`}
                          className="w-20 h-20 rounded-full object-cover mb-2"
                        />
                        <span className="font-medium text-sm text-primary">
                          {getLevel(user.totalScore)}
                        </span>
                        <h2 className="text-lg font-semibold text-gray-800">
                          {user.name}
                        </h2>
                        <p className="text-sm text-gray-600">
                          Score: {user.totalScore}
                        </p>
                        {index === 0 && (
                          <div className="absolute right-0 bottom-0 w-20 h-16 bg-primary [clip-path:polygon(100%_0,0_100%,100%_100%)]">
                            <div className="absolute right-2 bottom-2">
                              <Crown color="white" />
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      ""
                    )}
                  </div>
                )
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
