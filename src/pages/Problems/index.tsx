import { useGetAllProblems } from "@/api/problems";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Key, useState } from "react";
import { Link } from "react-router-dom";

export default function Problem() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useGetAllProblems(page);

  const handlePreviousPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  const handleNextPage = () => {
    if (data && page < Math.ceil(data?.data?.length / 8)) {
      setPage(page + 1);
    }
  };

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
            {isLoading
              ? Array.from({ length: 8 }).map((_, index) => (
                  <Skeleton key={index} className="bg-gray-200 w-full h-48" />
                ))
              : data?.data?.map(
                  (
                    question: {
                      _id: number;
                      title: string;
                      points: number;
                      category: string;
                      description: string;
                    },
                    index: Key
                  ) => (
                    <Link
                      to={`/problems/${question?._id}`}
                      key={index}
                      className="p-4 border border-gray-300 rounded-lg hover:bg-slate-50 flex flex-col gap-4"
                    >
                      <div>
                        <div>
                          <p className="text-lg font-extrabold">
                            {question?.title}
                          </p>
                          <p className="text-sm">
                            Points:{" "}
                            <span className="text-primary font-bold">
                              {question?.points}
                            </span>
                          </p>
                        </div>
                        <p className="bg-primary px-1.5 rounded-full text-xs text-white font-bold py-0.5 inline-block mt-2">
                          {question?.category}
                        </p>
                      </div>
                      <p className="line-clamp-2">{question?.description}</p>
                    </Link>
                  )
                )}
          </div>
          <div className="flex items-center justify-end gap-2">
            {/* <Link to={`${API_URL}/ctf/problems?page=${}`}> */}
            <Button
              className="font-bold"
              variant={"secondary"}
              onClick={handlePreviousPage}
              disabled={page === 1}
            >
              Previous
            </Button>
            {/* </Link> */}
            {/* <Link to="/"> */}
            <Button
              className="font-bold"
              variant={"secondary"}
              onClick={handleNextPage}
              disabled={page === Math.ceil(data?.data?.length / 8)}
            >
              Next
            </Button>
            {/* </Link> */}
          </div>
        </div>
      </div>
    </>
  );
}
