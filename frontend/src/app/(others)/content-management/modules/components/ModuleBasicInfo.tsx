import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface ModuleBasicInfoProps {
  moduleCode: string;
  title: string;
  name: string;
  description: string;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

export function ModuleBasicInfo({ 
  moduleCode, 
  title,
  name,
  description, 
  onInputChange 
}: ModuleBasicInfoProps) {
  return (
    <div className="space-y-4 py-4">
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="moduleCode" className="text-right">
          Module Code
        </Label>
        <Input
          id="moduleCode"
          name="moduleCode"
          placeholder="e.g., MOD101"
          className="col-span-3"
          value={moduleCode}
          onChange={onInputChange}
          required
        />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="title" className="text-right font-medium">
          Module Title
        </Label>
        <Input
          id="title"
          name="title"
          placeholder="Enter module title"
          className="col-span-3"
          value={title}
          onChange={onInputChange}
          required
        />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="name" className="text-right font-medium">
          Module Name
        </Label>
        <Input
          id="name"
          name="name"
          placeholder="Enter module name"
          className="col-span-3"
          value={name}
          onChange={onInputChange}
          required
        />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="description" className="text-right">
          Description
        </Label>
        <Textarea
          id="description"
          name="description"
          placeholder="Brief description of the module"
          className="col-span-3"
          value={description}
          onChange={onInputChange}
          rows={3}
        />
      </div>
    </div>
  );
} 