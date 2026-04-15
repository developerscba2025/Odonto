export declare const CONDITIONS: {
    id: string;
    label: string;
    color: string;
}[];
interface OdontogramProps {
    conditions: Record<number, string>;
    onToothClick: (toothNumber: number) => void;
    readOnly?: boolean;
}
export default function Odontogram({ conditions, onToothClick, readOnly }: OdontogramProps): import("react/jsx-runtime").JSX.Element;
export {};
