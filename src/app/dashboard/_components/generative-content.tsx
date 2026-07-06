import { Button } from '@/components/ui/button';
import { ButtonGroup } from '@/components/ui/button-group';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { Field } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import {
  generateChart,
  generateImage,
  generateVideo,
} from '@/features/ai/generative-content';
import { convertToIDR } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { ChartPieIcon, ImageIcon, SparklesIcon, VideoIcon } from 'lucide-react';
import Image from 'next/image';
import { KeyboardEvent, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from 'recharts';
import { toast } from 'sonner';
import z from 'zod';

const formSchema = z.object({
  request: z.string().min(1, 'Request is required'),
});

export default function GenerativeContent() {
  const [insightType, setInsightType] = useState<'chart' | 'image' | 'video'>(
    'chart',
  );

  const [result, setResult] = useState<
    | {
        type: 'chart';
        chartType: 'bar' | 'pie';
        data: { name: string; value: number }[];
      }
    | {
        type: 'image';
        data: string;
      }
    | {
        type: 'video';
        data: string;
      }
    | null
  >(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      request: '',
    },
  });

  const { mutate, isPending, error } = useMutation({
    mutationFn: async (request: string) => {
      switch (insightType) {
        case 'chart':
          const result = await generateChart(request);
          return { ...result, type: 'chart' };
        case 'image':
          const resultImage = await generateImage(request);
          return {
            type: 'image',
            data: resultImage,
          };

        case 'video':
          const resultVideo = await generateVideo(request);
          return {
            type: 'video',
            data: resultVideo,
          };

        default:
          return null;
      }
    },
    onSuccess: (response) => {
      setResult(response);
      form.reset();
      toast.success(`Success generate ${insightType}`);
    },
    onError: (error) => {
      toast.error(
        error instanceof Error
          ? error.message
          : 'Failed to process your request',
      );
    },
  });

  function onSubmit(data: z.infer<typeof formSchema>) {
    mutate(data.request);
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSubmit(form.getValues());
    }
  }

  // 1. Transformasi data dan buat chartConfig secara dinamis
  const { chartConfig, processedData } = useMemo(() => {
    if (!result || result.type !== 'chart')
      return { chartConfig: {}, processedData: [] };

    const config: ChartConfig = {};
    const { chartType, data } = result;

    // Shadcn punya 5 variabel warna bawaan di CSS (--chart-1 s.d --chart-5)
    const getChartColor = (index: number) => `var(--chart-${(index % 5) + 1})`;

    if (chartType === 'pie') {
      // Untuk Pie Chart: Tiap item data butuh config warna unik sendiri
      const mappedData = data.map((item, index) => {
        // Buat key yang aman untuk objek/CSS (clean string)
        const configKey = item.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '_')
          .replace(/^_+|_+$/g, '');

        config[configKey] = {
          label: item.name,
          color: getChartColor(index),
        };

        return {
          ...item,
          // Recharts Pie membaca properti 'fill' langsung dari objek data jika tidak di-override
          fill: `var(--color-${configKey})`,
        };
      });

      return { chartConfig: config, processedData: mappedData };
    } else {
      // Untuk Bar Chart: Kita bisa pakai satu config global untuk key 'value'
      config['value'] = {
        label: 'Nilai',
        color: 'var(--chart-1)',
      };

      // Jika ingin Bar-nya warna-warni seperti Pie, gunakan mapping di bawah ini:
      const mappedData = data.map((item, index) => {
        const configKey = item.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '_')
          .replace(/^_+|_+$/g, '');
        config[configKey] = {
          label: item.name,
          color: getChartColor(index),
        };
        return {
          ...item,
          fill: `var(--color-${configKey})`,
        };
      });

      return { chartConfig: config, processedData: mappedData };
    }
  }, [result]);

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-4 justify-between lg:flex-row lg:items-center">
          <CardTitle className="flex gap-2 items-center text-xl">
            <SparklesIcon className="size-5 text-primary" />
            Generative AI Insight
          </CardTitle>
          <form
            className="flex flex-col gap-2 lg:flex-row lg:items-center"
            onSubmit={form.handleSubmit(onSubmit)}
          >
            <ButtonGroup>
              <Button
                type="button"
                variant={insightType === 'chart' ? 'default' : 'secondary'}
                size="icon"
                onClick={() => setInsightType('chart')}
              >
                <ChartPieIcon />
              </Button>
              <Button
                type="button"
                variant={insightType === 'image' ? 'default' : 'secondary'}
                size="icon"
                onClick={() => setInsightType('image')}
              >
                <ImageIcon />
              </Button>
              <Button
                type="button"
                variant={insightType === 'video' ? 'default' : 'secondary'}
                size="icon"
                onClick={() => setInsightType('video')}
              >
                <VideoIcon />
              </Button>
            </ButtonGroup>
            <div className="flex flex-row gap-2">
              <Controller
                control={form.control}
                name="request"
                render={({ field }) => (
                  <Field>
                    <Input
                      {...field}
                      id="form-request"
                      placeholder="Insert your request..."
                      className="w-50 lg:w-70"
                      onKeyDown={handleKeyDown}
                      disabled={isPending}
                      autoComplete="off"
                    />
                  </Field>
                )}
              />
              <Button type="submit" disabled={isPending}>
                {isPending ? <Spinner /> : <SparklesIcon />}
                <span className="hidden lg:inline">
                  {isPending ? 'Generating...' : result ? 'Update' : 'Generate'}
                </span>
              </Button>
            </div>
          </form>
        </div>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="p-4 text-sm rounded-lg border text-destructive border-destructive/50 bg-destructive/10">
            {error.message}
          </div>
        )}

        {!result ? (
          <div className="flex justify-center items-center rounded-lg border-2 border-dashed h-70">
            {isPending ? (
              <div className="flex gap-2 items-center">
                <Spinner />
                <span>AI is generating insight</span>
              </div>
            ) : (
              <span className="text-lg text-muted-foreground/50">
                Generate insight content with AI
              </span>
            )}
          </div>
        ) : (
          <div className="h-full">
            {result.type === 'chart' && (
              <ChartContainer
                config={chartConfig}
                className="w-full max-h-80 min-h-40"
              >
                {result.chartType === 'bar' ? (
                  <BarChart accessibilityLayer data={processedData}>
                    <CartesianGrid vertical={false} />
                    <XAxis
                      dataKey="name"
                      tickLine={false}
                      tickMargin={10}
                      axisLine={false}
                    />
                    <YAxis
                      fontSize={8}
                      tickLine={false}
                      tickFormatter={(value) =>
                        convertToIDR(Number(value) || 0)
                      }
                      axisLine={false}
                    />
                    <ChartTooltip
                      cursor={false}
                      content={
                        <ChartTooltipContent
                          hideLabel
                          formatter={(value, name) => (
                            <div className="flex min-w-[150px] gap-2 items-center text-xs text-muted-foreground">
                              {/* <div
                              className="size-2.5 shrink-0 rounded-[2px] bg-(--color-bg)"
                              style={
                                {
                                  '--color-bg': `var(--color-${name})`,
                                } as React.CSSProperties
                              }
                            /> */}
                              {chartConfig[name as keyof typeof chartConfig]
                                ?.label || name}
                              <div className="ml-auto flex items-baseline gap-0.5 font-mono font-medium text-foreground tabular-nums">
                                {convertToIDR(Number(value) || 0)}
                              </div>
                            </div>
                          )}
                        />
                      }
                    />
                    <Bar
                      dataKey="value"
                      fill="var(--color-value)"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                ) : (
                  <PieChart>
                    <ChartTooltip
                      cursor={false}
                      content={
                        <ChartTooltipContent
                          formatter={(value, name) => (
                            <div className="flex min-w-[150px] gap-2 items-center text-xs text-muted-foreground">
                              {/* <div
                              className="size-2.5 shrink-0 rounded-[2px] bg-(--color-bg)"
                              style={
                                {
                                  '--color-bg': `var(--color-${name})`,
                                } as React.CSSProperties
                              }
                            /> */}
                              {chartConfig[name as keyof typeof chartConfig]
                                ?.label || name}
                              <div className="ml-auto flex items-baseline gap-0.5 font-mono font-medium text-foreground tabular-nums">
                                {convertToIDR(Number(value) || 0)}
                              </div>
                            </div>
                          )}
                        />
                      }
                    />
                    <Pie
                      data={processedData}
                      dataKey="value"
                      nameKey="name"
                      label={(props) => {
                        return (
                          <text
                            cx={props.cx}
                            cy={props.cy}
                            x={props.x}
                            y={props.y}
                            textAnchor={props.textAnchor}
                            dominantBaseline={props.dominantBaseline}
                            fill="var(--foreground)"
                          >
                            {`${props.name} (${((props.percent || 0) * 100).toFixed(0)}%)`}
                          </text>
                        );
                      }}
                    />
                  </PieChart>
                )}
              </ChartContainer>
            )}

            {result.type === 'image' && (
              <div className="flex flex-col gap-2 items-center">
                <p className="text-sm text-muted-foreground">
                  (Hanya sebagai contoh, fitur ini memerlukan API berbayar)
                </p>
                <Image
                  width={1920}
                  height={1080}
                  src={result.data}
                  alt="Generate Image"
                  className="rounded-xl"
                />
              </div>
            )}

            {result.type === 'video' && (
              <div className="flex flex-col gap-2 items-center">
                <p className="text-sm text-muted-foreground">
                  (Hanya sebagai contoh, fitur ini memerlukan API berbayar)
                </p>
                {/* Contoh video */}
                <iframe
                  src="https://www.youtube.com/embed/dQw4w9WgXcQ?si=40Z_ZKhtfuBj4SI6"
                  title="YouTube video player"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                  className="w-full rounded-xl border aspect-video"
                ></iframe>
                {/* Hasil asli dari API */}
                {/* <video
                  src={result.data}
                  controls
                  className="w-full rounded-xl border aspect-video"
                >
                  Your browser doesn&apos;t support
                </video> */}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
