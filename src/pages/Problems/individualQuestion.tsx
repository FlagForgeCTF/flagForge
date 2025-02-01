import { Button } from "@/components/ui/button";
import { Link } from "react-router";
import { ChevronLeft } from "lucide-react";

export default function AProblem() {
  return (
    <>
      <div className="px-12 py-8 max-w-screen-2xl w-full mx-auto">
        <Link to="/problems" className="mb-4 inline-block">
          <Button variant={"outline"}>
            <ChevronLeft />
            Back
          </Button>
        </Link>
        <div className="flex flex-col gap-2 pb-4">
          <div className="flex items-center gap-2">
            <p className="font-bold text-3xl">Analyze PCAP?</p>
            <p className="bg-primary px-1.5 rounded-full text-xs text-white font-bold py-0.5 inline-block mt-2">
              Forensics
            </p>
          </div>
          <p>
            Points: <span className="text-primary font-bold">60</span>
          </p>
        </div>
        <hr />
        <div className="mt-8 flex flex-col gap-6">
          <div className="flex flex-col gap-1">
            <p className="font-bold text-xl">Description</p>
            <p>Analyze this pcap file.</p>
          </div>
          <div>
            <p className="font-bold text-xl">Resources</p>
            <Link to="/">https://pcap-goec.onrender.com/download</Link>
          </div>
          <form className="border border-gray-400 rounded-lg p-6 flex flex-col gap-3">
            <input
              type="text"
              placeholder="Flag here!"
              name="flag"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus-within:outline-offset-4 focus-within:outline-primary"
            />
            <Button type="submit" className="font-bold text-base">
              Submit flag
            </Button>
          </form>
        </div>
      </div>
    </>
  );
}
