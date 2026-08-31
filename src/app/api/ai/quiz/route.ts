import { NextRequest, NextResponse } from 'next/server';

const TOPIC_QUESTIONS: Record<string, any[]> = {
  calculus: [
    {
      id: 'q-calc-1',
      question: 'إذا كانت $y = \\sin(3x^2)$، فإن المشتقة الأولى $\\frac{dy}{dx}$ تساوي:',
      options: [
        { id: 'opt-a', text: '$6x \\cos(3x^2)$', isCorrect: true },
        { id: 'opt-b', text: '$3x \\cos(3x^2)$', isCorrect: false },
        { id: 'opt-c', text: '$-6x \\cos(3x^2)$', isCorrect: false },
        { id: 'opt-d', text: '$6x \\sin(3x^2)$', isCorrect: false },
      ],
      explanation: 'باستخدام قاعدة السلسلة (Chain Rule): مشتقة الدالة الخارجية $\\cos(3x^2)$ مضروبة في مشتقة ما بداخل القوس $6x$.',
    },
    {
      id: 'q-calc-2',
      question: 'ناتج التكامل $\\int (4x^3 - 6x + 5) dx$ هو:',
      options: [
        { id: 'opt-a', text: '$x^4 - 3x^2 + 5x + C$', isCorrect: true },
        { id: 'opt-b', text: '$12x^2 - 6 + C$', isCorrect: false },
        { id: 'opt-c', text: '$x^4 - 6x^2 + 5x + C$', isCorrect: false },
        { id: 'opt-d', text: '$4x^4 - 3x^2 + 5x + C$', isCorrect: false },
      ],
      explanation: 'نزيد الأس بواحد ونقسم على الأس الجديد لكل حد: $\\frac{4x^4}{4} - \\frac{6x^2}{2} + 5x = x^4 - 3x^2 + 5x + C$.',
    },
    {
      id: 'q-calc-3',
      question: 'ميل المماس للمنحنى $y = x^2 - 4x + 3$ عند النقطة $(2, -1)$ يساوي:',
      options: [
        { id: 'opt-a', text: '$0$', isCorrect: true },
        { id: 'opt-b', text: '$2$', isCorrect: false },
        { id: 'opt-c', text: '$-4$', isCorrect: false },
        { id: 'opt-d', text: '$4$', isCorrect: false },
      ],
      explanation: 'المشتقة الأولى $y\' = 2x - 4$. بالتعويض عن $x = 2$: $y\' = 2(2) - 4 = 0$ (مماس أفقي).',
    },
  ],
  physics: [
    {
      id: 'q-phys-1',
      question: 'ثلاث مقاومات متماثلة قيمة كل منها $6\\,\\Omega$ متصلة معاً على التوازي، فإن المقاومة المكافئة تساوي:',
      options: [
        { id: 'opt-a', text: '$2\\,\\Omega$', isCorrect: true },
        { id: 'opt-b', text: '$18\\,\\Omega$', isCorrect: false },
        { id: 'opt-c', text: '$3\\,\\Omega$', isCorrect: false },
        { id: 'opt-d', text: '$6\\,\\Omega$', isCorrect: false },
      ],
      explanation: 'في حالة التوصيل على التوازي لمقاومات متماثلة: $R_{eq} = \\frac{R}{n} = \\frac{6}{3} = 2\\,\\Omega$.',
    },
    {
      id: 'q-phys-2',
      question: 'إذا زادت شدة التيار المار في موصل للضعف، فإن القدرة المستهلكة في الموصل (مع ثبوت المقاومة):',
      options: [
        { id: 'opt-a', text: 'تزداد لأربعة أمثالها ($4P$)', isCorrect: true },
        { id: 'opt-b', text: 'تزداد للضعف ($2P$)', isCorrect: false },
        { id: 'opt-c', text: 'تظل ثابتة', isCorrect: false },
        { id: 'opt-d', text: 'تقل للنصف', isCorrect: false },
      ],
      explanation: 'قانون القدرة: $P = I^2 R$. بما أن التيار تضاعف $(2I)^2 = 4I^2$، فإن القدرة تصبح أربعة أضعاف.',
    },
  ],
  mechanics: [
    {
      id: 'q-mech-1',
      question: 'قوتان متساويتان مقدارهما $F$ والزاوية بينهما $120^\\circ$، فإن مقدار محصلتهما يساوي:',
      options: [
        { id: 'opt-a', text: '$F$', isCorrect: true },
        { id: 'opt-b', text: '$2F$', isCorrect: false },
        { id: 'opt-c', text: '$\\sqrt{3} F$', isCorrect: false },
        { id: 'opt-d', text: '$0$', isCorrect: false },
      ],
      explanation: 'قانون المحصلة لقوتين متساويتين: $R = 2F \\cos(\\frac{\\alpha}{2}) = 2F \\cos(60^\\circ) = 2F (0.5) = F$.',
    },
  ],
  algebra: [
    {
      id: 'q-alg-1',
      question: 'إذا كان المتجه $\\vec{A} = (2, -1, 3)$ والمتجه $\\vec{B} = (1, 4, 2)$، فإن حاصل الضرب القياسي $\\vec{A} \\cdot \\vec{B}$ يساوي:',
      options: [
        { id: 'opt-a', text: '$4$', isCorrect: true },
        { id: 'opt-b', text: '$12$', isCorrect: false },
        { id: 'opt-c', text: '$-4$', isCorrect: false },
        { id: 'opt-d', text: '$8$', isCorrect: false },
      ],
      explanation: '$\\vec{A} \\cdot \\vec{B} = (2)(1) + (-1)(4) + (3)(2) = 2 - 4 + 6 = 4$.',
    },
  ],
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { subject = 'calculus', count = 3 } = body;

    const pool = TOPIC_QUESTIONS[subject] || TOPIC_QUESTIONS.calculus;
    const questions = pool.slice(0, count);

    return NextResponse.json({
      success: true,
      subject,
      totalQuestions: questions.length,
      questions,
    });
  } catch (error) {
    console.error('AI Quiz error:', error);
    return NextResponse.json({ error: 'فشل في توليد الأسئلة' }, { status: 500 });
  }
}
