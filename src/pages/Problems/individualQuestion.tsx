import { Button } from "@/components/ui/button";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { useGetAProblem, usePostProblem } from "@/api/problems";
import { Skeleton } from "@/components/ui/skeleton";
import { ChangeEvent, FormEvent, useState } from "react";
import ConfettiBoom from "react-confetti-boom";
import doubt from "@/assets/img/doubt.png";
import { toast } from "@/hooks/use-toast";

export default function AProblem() {
  const { problemId } = useParams();
  const { data, isLoading } = useGetAProblem(problemId as string);
  const [redirecting, setRedirecting] = useState(false);
  const [counter, setCounter] = useState(60);
  const { mutate, isPending, isSuccess } = usePostProblem(problemId as string);

  const navigate = useNavigate();

  const [formData, setFormData] = useState<{
    flag: string;
  }>({
    flag: "",
  });

  const question = data?.data;

  const handleButtonClick = () => {
    if (question?.link) {
      setRedirecting(true);
      window.open(question?.link, "_blank");

      const timer = setInterval(() => {
        setCounter((prevCounter) => prevCounter - 1);
      }, 1000);

      setTimeout(() => {
        clearInterval(timer);
        setRedirecting(false);
        setCounter(60);
      }, 60000);
    }
  };

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };
  const handleFlagSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const payload: { flag: string } = {
      flag: formData.flag,
    };

    mutate(payload, {
      onSuccess: () => {
        toast({
          title: "Successfully submitted.",
          variant: "success",
        });

        setTimeout(() => {
          navigate("/problems", { replace: true });
        }, 1000);
      },
      onError: (error) => {
        toast({
          title: error.response?.data?.message || "Something went wrong",
          variant: "destructive",
        });
      },
    });
  };

  return (
    <>
      <div className="px-12 py-8 max-w-screen-2xl w-full mx-auto">
        <Link to="/problems" className="mb-4 inline-block">
          <Button variant={"outline"}>
            <ChevronLeft />
            Back
          </Button>
        </Link>

        {question?.done ? (
          <div className="max-w-screen-2xl mx-auto">
            <div className="flex flex-col gap-8 justify-center items-center">
              <img src={doubt} alt="Doubting skill" className="w-72" />
              <p className="w-full mx-auto text-center text-lg">
                Doubting your skills? Let's return to{" "}
                <Link to="/problems" className="text-rose-500">
                  problems
                </Link>
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-2 pb-4">
              <div className="flex items-center gap-2">
                <div>
                  {isLoading ? (
                    <Skeleton className="w-48 h-8" />
                  ) : (
                    <p className="font-bold text-3xl"> {question?.title}</p>
                  )}
                </div>
                <div className="bg-primary px-1.5 rounded-full text-xs text-white font-bold py-0.5 inline-block mt-2">
                  {isLoading ? (
                    <Skeleton className="w-12 h-4 bg-primary/25" />
                  ) : (
                    <p> {question?.category}</p>
                  )}
                </div>
              </div>
              <div>
                Points:{" "}
                <span>
                  {isLoading ? (
                    <Skeleton className="w-8 h-4" />
                  ) : (
                    <span className="text-primary font-bold">
                      {question?.points}
                    </span>
                  )}
                </span>
              </div>
            </div>
            <hr />
            <div className="mt-8 flex flex-col gap-6">
              <div className="flex flex-col gap-1">
                <p className="font-bold text-xl">Description</p>
                {isLoading ? (
                  <div>
                    {Array.from({ length: 4 }).map((_, index) => (
                      <Skeleton key={index} className="w-full h-4 mb-2" />
                    ))}
                  </div>
                ) : (
                  question?.description
                )}
              </div>
              <div className="flex items-center gap-2">
                <p className="font-bold text-xl">Resources</p>
                {isLoading ? (
                  <Skeleton className="w-48 h-4" />
                ) : (
                  <Button
                    variant={"outline"}
                    className="border-2 border-primary"
                    onClick={handleButtonClick}
                    disabled={redirecting}
                  >
                    {redirecting
                      ? `Redirecting in ${counter} seconds...`
                      : "Download / Visit Resource"}
                  </Button>
                  // <Link to={question?.link}>{question?.link}</Link>
                )}
              </div>
              <form
                className="border border-gray-400 rounded-lg p-6 flex flex-col gap-3"
                onSubmit={handleFlagSubmit}
              >
                <input
                  type="text"
                  id="flag"
                  placeholder="Flag here!"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus-within:outline-offset-4 focus-within:outline-primary"
                  value={formData.flag}
                  onChange={handleChange}
                />
                <Button
                  type="submit"
                  className={`font-bold text-base bg-primary/70 ${
                    isPending || isSuccess
                      ? "cursor-not-allowed"
                      : "cursor-pointer"
                  }`}
                  disabled={isPending || isSuccess}
                >
                  Submit flag
                </Button>
              </form>
              {isSuccess ? (
                <div className="max-w-screen-xl overflow-clip">
                  <ConfettiBoom
                    mode="boom"
                    colors={[
                      "#FF6347",
                      "#FFD700",
                      "#00FF00",
                      "#1E90FF",
                      "#FF69B4",
                    ]}
                    particleCount={350}
                    shapeSize={12}
                    deg={270}
                    effectInterval={6000}
                    spreadDeg={60}
                    launchSpeed={1.9}
                    x={0.5}
                    y={0.5}
                  />
                </div>
              ) : (
                ""
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
}
