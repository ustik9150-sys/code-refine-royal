const CodFormLogo = ({ size = "md" }: { size?: "sm" | "md" | "lg" }) => {
  const textSize = size === "sm" ? "text-sm" : size === "lg" ? "text-2xl" : "text-xl";
  const badgeSize = size === "sm" ? "text-[7px] px-1 py-px" : "text-[9px] px-1.5 py-0.5";

  return (
    <span className={`${textSize} font-bold flex items-center gap-1`} dir="ltr">
      <span className="tracking-tight text-foreground">Cod</span>
      <span className="font-extrabold text-foreground">Form</span>
      <span
        className={`${badgeSize} text-white rounded font-bold`}
        style={{ background: "linear-gradient(135deg, hsl(250 80% 65%), hsl(340 75% 55%))" }}
      >
        PRO
      </span>
    </span>
  );
};

export default CodFormLogo;
