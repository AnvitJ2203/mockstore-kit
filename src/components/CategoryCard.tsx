import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface CategoryCardProps {
  name: string;
  icon: LucideIcon;
  itemCount: number;
}

export const CategoryCard = ({ name, icon: Icon, itemCount }: CategoryCardProps) => {
  return (
    <Link to={`/category/${name.toLowerCase()}`}>
      <Card className="group cursor-pointer transition-all hover:shadow-lg hover:scale-105">
        <CardContent className="flex flex-col items-center justify-center p-6">
          <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 transition-colors group-hover:bg-primary/20">
            <Icon className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-center font-semibold">{name}</h3>
          <p className="text-sm text-muted-foreground">{itemCount} items</p>
        </CardContent>
      </Card>
    </Link>
  );
};
