import Container from "../common/container";
import LoadingIcon from "../loading-icon";

export default function LoadingScreen() {
  return (
    <Container>
      <div className="flex flex-col gap-4 items-center justify-center min-h-screen">
        <LoadingIcon />
      </div>
    </Container>
  );
}
