import error404 from "@/assets/img/404.png";

export default function NotFoundPage() {
  return (
    <>
      <div className="w-full py-12 flex flex-col items-center gap-2">
        <img src={error404} alt="404 Image" className="w-80 mx-auto" />
        <p className="text-4xl tracking-tighter font-bold text-red-500">
          404: Not Found
        </p>
      </div>
    </>
  );
}
