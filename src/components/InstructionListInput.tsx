
import { Plus, Minus } from "lucide-react";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

interface InstructionListInputProps {
  value: string[];
  onChange: (val: string[]) => void;
  disabled?: boolean;
}

const InstructionListInput = ({ value, onChange, disabled }: InstructionListInputProps) => {
  useEffect(() => {
    if (value.length === 0) {
      onChange([""]);
    }
    // eslint-disable-next-line
  }, []);

  const handleInstructionChange = (i: number, newVal: string) => {
    const next = value.slice();
    next[i] = newVal;
    onChange(next);
  };

  const handleAdd = () => onChange([...value, ""]);
  const handleRemove = (i: number) => {
    const next = value.slice();
    next.splice(i, 1);
    onChange(next.length > 0 ? next : [""]);
  };

  return (
    <div className="flex flex-col gap-2">
      {value.map((step, i) => (
        <div key={i} className="flex gap-2 items-center">
          <textarea
            value={step}
            className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm min-h-[38px]"
            placeholder={`ขั้นตอนที่ ${i + 1}`}
            onChange={e => handleInstructionChange(i, e.target.value)}
            disabled={disabled}
            required
          />
          <Button
            type="button"
            size="icon"
            variant="ghost"
            onClick={() => handleRemove(i)}
            tabIndex={-1}
            aria-label="ลบขั้นตอนนี้"
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
        เพิ่มขั้นตอน
      </Button>
    </div>
  );
};

export default InstructionListInput;
