// Stub implementations for cursor/canvas imports
export const Stack = ({ children, ...p }: any) => <div {...p}>{children}</div>;
export const Row = ({ children, ...p }: any) => <div style={{ display: "flex", ...p.style }} {...p}>{children}</div>;
export const Grid = ({ children, ...p }: any) => <div style={{ display: "grid", ...p.style }} {...p}>{children}</div>;
export const Card = ({ children, ...p }: any) => <div {...p}>{children}</div>;
export const CardHeader = ({ children, ...p }: any) => <div {...p}>{children}</div>;
export const CardBody = ({ children, ...p }: any) => <div {...p}>{children}</div>;
export const H2 = ({ children, ...p }: any) => <h2 {...p}>{children}</h2>;
export const H3 = ({ children, ...p }: any) => <h3 {...p}>{children}</h3>;
export const Text = ({ children, ...p }: any) => <span {...p}>{children}</span>;
export const Button = ({ children, ...p }: any) => <button {...p}>{children}</button>;
export const Divider = () => <hr style={{ border: "none", borderTop: "1px solid #E4E7ED", margin: "12px 0" }} />;
export const Spacer = ({ size = 8 }: any) => <div style={{ height: size }} />;
export const Pill = ({ children, ...p }: any) => <span style={{ padding: "2px 8px", borderRadius: 12, fontSize: 12 }} {...p}>{children}</span>;
export const Callout = ({ children, ...p }: any) => <div style={{ padding: 12, borderRadius: 6, background: "#EEF1FE" }} {...p}>{children}</div>;
export const Stat = ({ children, ...p }: any) => <div {...p}>{children}</div>;
export const Table = ({ children, ...p }: any) => <table {...p}>{children}</table>;
export const useHostTheme = () => ({ theme: "light" });
