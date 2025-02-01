import { Button } from "@/components/ui/button";
import { Link } from "react-router";

const questions = [
  {
    id: 1,
    title: "Analyze PCAP?",
    point: 60,
    category: "Forensics",
    description: "Analyze this pcap file.",
  },
  {
    id: 2,
    title: "Analyze PCAP?",
    point: 60,
    category: "Forensics",
    description: "Analyze this pcap file.",
  },
  {
    id: 3,
    title: "Analyze PCAP?",
    point: 60,
    category: "Forensics",
    description: "Analyze this pcap file.",
  },
  {
    id: 4,
    title: "Analyze PCAP?",
    point: 60,
    category: "Forensics",
    description: "Analyze this pcap file.",
  },
  {
    id: 5,
    title: "Analyze PCAP?",
    point: 60,
    category: "Forensics",
    description: "Analyze this pcap file.",
  },
];

export default function Problem() {
  return (
    <>
      <div className="max-w-screen-2xl mx-auto w-full px-12 py-8 flex flex-col gap-12">
        <div className="w-full flex flex-col gap-4">
          <h1 className="w-full text-4xl font-bold text-primary tracking-tight">
            Challenges
          </h1>
          <div className="flex items-center justify-between">
            <p>
              Score:{" "}
              <span className="text-primary font-bold tracking-tight">0</span>
            </p>
            <p>
              Question solved:{" "}
              <span className="text-primary font-bold tracking-tight">0</span>
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-4 gap-6">
            {questions.map((question, index) => (
              <Link
                to={`/problems/${question.id}`}
                key={index}
                className="p-4 border border-gray-300 rounded-lg hover:bg-slate-50 flex flex-col gap-4"
              >
                <div>
                  <div>
                    <p className="text-lg font-extrabold">{question.title}</p>
                    <p className="text-sm">
                      Points:{" "}
                      <span className="text-primary font-bold">
                        {question.point}
                      </span>
                    </p>
                  </div>
                  <p className="bg-primary px-1.5 rounded-full text-xs text-white font-bold py-0.5 inline-block mt-2">
                    {question.category}
                  </p>
                </div>
                <p className="line-clamp-2">{question.description}</p>
              </Link>
            ))}
          </div>
          <div className="flex items-center justify-end gap-2">
            <Link to="/">
              <Button className="font-bold" variant={"secondary"}>
                Previous
              </Button>
            </Link>
            <Link to="/">
              <Button className="font-bold" variant={"secondary"}>
                Next
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
