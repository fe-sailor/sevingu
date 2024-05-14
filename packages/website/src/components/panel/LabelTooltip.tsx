import {
	TooltipProvider,
	Tooltip,
	TooltipTrigger,
	TooltipContent,
} from '../ui/tooltip';

type Props = {
	children: React.ReactNode;
	name: string;
};

export default function LabelTooltip({ children, name }: Props) {
	return (
		<TooltipProvider>
			<Tooltip>
				<TooltipTrigger>{children}</TooltipTrigger>
				<TooltipContent>
					<p>{name}</p>
				</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	);
}
