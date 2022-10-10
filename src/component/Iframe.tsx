function Iframe(props: { src: string }) {
  return (
    <iframe
      style={{ width: "100%", height: "20rem", border: "none" }}
      src={props.src}
    ></iframe>
  );
}

export default Iframe;
