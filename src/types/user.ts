export interface UserI {
  id: string;
  name: string;
  displayName: string;
  email: string;
  role: string;
  score: string;
  image: string | undefined;
}

export interface UserDashboardResponseI {
  course_progress: CourseProgressI[];
  test: TestProgressI[];
}

export interface CourseProgressI {
  course_id: string;
  course_name: string;
  start_datetime: string;
  end_datetime: string;

  unit: {
    id: string;
    name: string;
    module_id: string;
    module: {
      id: string;
      title: string;
    };
  };

  progress: number;
}

export interface TestProgressI {
  test_id: string;
  test_title: string;
  test_score: number;
  duration: number;
  start_date: string;
  end_date: string;
}
