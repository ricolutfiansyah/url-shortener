import { JSX, splitProps } from 'solid-js';

type CardProps = JSX.HTMLAttributes<HTMLDivElement>;

export function Card(props: CardProps) {
  const [local, others] = splitProps(props, ['class', 'children']);
  return (
    <div class={`rounded-xl border border-border bg-card text-card-foreground shadow-sm ${local.class || ''}`} {...others}>
      {local.children}
    </div>
  );
}

export function CardHeader(props: CardProps) {
  const [local, others] = splitProps(props, ['class', 'children']);
  return (
    <div class={`flex flex-col space-y-1.5 p-6 ${local.class || ''}`} {...others}>
      {local.children}
    </div>
  );
}

export function CardTitle(props: JSX.HTMLAttributes<HTMLHeadingElement>) {
  const [local, others] = splitProps(props, ['class', 'children']);
  return (
    <h3 class={`text-lg font-semibold leading-none tracking-tight ${local.class || ''}`} {...others}>
      {local.children}
    </h3>
  );
}

export function CardDescription(props: JSX.HTMLAttributes<HTMLParagraphElement>) {
  const [local, others] = splitProps(props, ['class', 'children']);
  return (
    <p class={`text-sm text-muted-foreground ${local.class || ''}`} {...others}>
      {local.children}
    </p>
  );
}

export function CardContent(props: CardProps) {
  const [local, others] = splitProps(props, ['class', 'children']);
  return (
    <div class={`p-6 pt-0 ${local.class || ''}`} {...others}>
      {local.children}
    </div>
  );
}

export function CardFooter(props: CardProps) {
  const [local, others] = splitProps(props, ['class', 'children']);
  return (
    <div class={`flex items-center p-6 pt-0 ${local.class || ''}`} {...others}>
      {local.children}
    </div>
  );
}
