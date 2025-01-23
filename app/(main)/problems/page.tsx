"use client";
import React, { useState, useEffect } from "react";
import QustionCards from "@/components/QustionCards";
import Loading from "@/components/loading";
import AuthError from "@/components/authError";
import { IoFilter } from "react-icons/io5";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Questions } from "@/interfaces";

const page = () => {
  const { status: sessionStatus, data } = useSession();
  const [open, setOpen] = useState<boolean>(false);
  const [problems, setProblems] = useState<Questions[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [score, setScore] = useState<number>(0);
  const [questionDone, setQuestionDone] = useState<any>();

  type Problem = {
    _id: string;
    title: string;
    description: string;
    category: string;
    points: number;
    link: string;
    done: any;
    createdAt: string;
    updatedAt: string;
    __v: number;
    flag?: string; // Optional because we'll omit it
  };

  const fetchProblems = async () => {
    setLoading(true); // Start loading state

    try {
      const response = await fetch(`/api/problems?page=${currentPage}`);

      if (!response.ok) {
        const errorDetails = await response.json();
        throw new Error(errorDetails.message || "Failed to fetch problems");
      }

      const {
        data,
        totalScore,
        questionDone,
      }: { data: Problem[]; totalScore: number; questionDone: any } =
        await response.json();

      // Remove the `flag` field from each problem
      const sanitizedData = data.map(({ flag, ...rest }) => rest);
      setScore(totalScore);
      setProblems(sanitizedData);
      setQuestionDone(questionDone);
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Error fetching problems:", error.message);
        alert("Unable to fetch problems. Please try again later.");
      } else {
        console.error("An unexpected error occurred:", error);
      }
    } finally {
      setLoading(false); // Stop loading state
    }
  };

  useEffect(() => {
    fetchProblems();
  }, [currentPage]);
  const handleNextPage = () => {
    setCurrentPage((prevPage) => prevPage + 1);
  };

  const handlePrevPage = () => {
    setCurrentPage((prevPage) => prevPage - 1);
  };

  if (loading) {
    return <Loading />;
  }
  if (sessionStatus === "loading") {
    return <Loading />;
  }

  if (sessionStatus === "unauthenticated") {
    return <AuthError />;
  }
  const handleMenuClick: () => void = () => {
    setOpen(!open);
  };
  return (
    <div className="flex flex-col justify-center items-center gap-8 mx-8">
      <h1 className="text-4xl sm:text-5xl tracking-tight text-center text-rose-500 font-bold">
        Challenges
      </h1>
      <div className="flex justify-between w-full" onClick={handleMenuClick}>
        <div className="flex justify-between w-full">
          <h2 className="text-center text-xl sm:text-xl font-medium text-gray-600">
            Score: &nbsp;
            <span className="text-rose-500 font-extrabold">{score}</span>
          </h2>
          <p className="text-center text-xl sm:text-xl font-medium text-gray-600">
            Total Question Solved:{" "}
            <span className="text-rose-500 font-extrabold">
              {questionDone.length}
            </span>
          </p>
        </div>

        <div className="flex gap-2 items-center justify-center text-center text-xl sm:hidden font-medium text-gray-600">
          <IoFilter className="text-2xl" />
        </div>
      </div>

      <div className="mx-auto my-0 flex justify-between">
        <div className="mx-auto my-0 grid lg:grid-cols-4 md:grid-cols-3 grid-cols-1 sm:grid-cols-2 items-center gap-4">
          {problems.map(
            ({
              title,
              category,
              points,
              description,
              _id,
              done,
            }: Questions) => (
              <QustionCards
                key={title}
                title={title}
                category={category}
                points={points}
                description={description.substring(0, 95)}
                done={questionDone}
                _id={_id}
              />
            )
          )}
        </div>
      </div>
      <div className="flex justify-end gap-4 w-full">
        <button
          onClick={handlePrevPage}
          disabled={currentPage === 1}
          className="bg-rose-500 hover:bg-rose-800 font-medium text-base rounded-lg px-4 py-2 text-white"
        >
          Previous
        </button>
        <button
          onClick={handleNextPage}
          className="bg-rose-500 hover:bg-rose-800 font-medium text-base rounded-lg px-4 py-2 text-white"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default page;
