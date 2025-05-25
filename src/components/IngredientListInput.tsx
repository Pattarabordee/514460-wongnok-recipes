
import { Plus, Minus } from "lucide-react";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export interface Ingredient {
  name: string;
  quantity: string;
  unit: string;
}

interface IngredientListInputProps {
  value: Ingredient[];
  onChange: (val: Ingredient[]) => void;
  disabled?: boolean;
}

const IngredientListInput = ({
  value,
  onChange,
  disabled,
}: IngredientListInputProps) => {
  useEffect(() => {
    if (!value || value.length === 0) {
      onChange([{ name: "", quantity: "", unit: "" }]);
    }
    // eslint-disable-next-line
  }, []);

  const handleChange = (i: number, key: keyof Ingredient, newVal: string) => {
    const next = value.slice();
    next[i] = { ...next[i], [key]: newVal };
    onChange(next);
  };

  const handleAdd = () =>
    onChange([...value, { name: "", quantity: "", unit: "" }]);

  const handleRemove = (i: number) => {
    const next = value.slice();
    next.splice(i, 1);
    onChange(next.length > 0 ? next : [{ name: "", quantity: "", unit: "" }]);
  };

  return (
    <div className="flex flex-col gap-3 w-full">
      {value.map((ingredient, i) => (
        <div
          key={i}
          className="flex flex-row gap-3 items-center w-full"
        >
          <input
            type="text"
            className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm"
            placeholder={`วัตถุดิบ #${i + 1}`}
            value={ingredient.name}
            onChange={(e) => handleChange(i, "name", e.target.value)}
            disabled={disabled}
            required
          />
          <input
            type="text"
            className="w-20 min-w-[72px] px-2 py-2 border border-gray-300 rounded text-sm"
            placeholder="จำนวน"
            value={ingredient.quantity}
            onChange={(e) => handleChange(i, "quantity", e.target.value)}
            disabled={disabled}
            required
            inputMode="decimal"
          />
          <input
            type="text"
            className="w-28 min-w-[96px] px-2 py-2 border border-gray-300 rounded text-sm"
            placeholder="หน่วย (เช่น กรัม, ช้อนโต๊ะ)"
            value={ingredient.unit}
            onChange={(e) => handleChange(i, "unit", e.target.value)}
            disabled={disabled}
            required
          />
          <Button
            type="button"
            size="icon"
            variant="ghost"
            onClick={() => handleRemove(i)}
            tabIndex={-1}
            aria-label="ลบวัตถุดิบนี้"
            disabled={disabled || value.length === 1}
          >
            <Minus className="w-4 h-4" />
          </Button>
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleAdd}
        className="mt-1 w-fit"
        disabled={disabled}
      >
        <Plus className="w-4 h-4 mr-1" />
        เพิ่มวัตถุดิบ
      </Button>
    </div>
  );
};

export default IngredientListInput;
