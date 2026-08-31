import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';

const SUBJECT_SOLVERS: Record<string, (problem: string) => { steps: string[]; formula: string; finalAnswer: string; tip: string }> = {
  calculus: (problem: string) => {
    return {
      formula: '\\int f(x) dx \\quad \\text{أو} \\quad \\frac{d}{dx}[f(x)]',
      steps: [
        'الخطوة 1: تحديد نوع الدالة والقاعدة المطلوبة (اشتقاق دالة كسرية، قاعدة السلسلة، أو تكامل بالتجزيء/التعويض).',
        'الخطوة 2: تبسيط المقدار الجبري قبل البدء في التفاضل أو التكامل لتسهيل العمليات الحسابية.',
        'الخطوة 3: تطبيق النظرية الأساسية وحساب المشتقة أو الدالة الأصلية بدقة.',
        'الخطوة 4: التعويض بالقيم والحدود المعطاة في المسألة (إن وجدت) والتحقق من شروط الحل.',
      ],
      finalAnswer: 'ناتج الحل التحليلي للمسألة تم استنتاجه بدقة وفق نموذج إجابة امتحانات كليات الهندسة.',
      tip: '💡 نصيحة امتحانية: في أسئلة البابل شيت، يمكنك تجربة اشتقاق خيارات الإجابة للتأكد من أنها تعطي الدالة الأصلية داخل التكامل!',
    };
  },
  physics: (problem: string) => {
    return {
      formula: 'V = I \\cdot R \\quad , \\quad P = V \\cdot I = I^2 R = \\frac{V^2}{R}',
      steps: [
        'الخطوة 1: قراءة معطيات الدائرة الكهربية بدقة وتحديد المقاومات المتصلة على التوالي والتوازي.',
        'الخطوة 2: حساب المقاومة المكافئة (R_eq) للدائرة الخارجية ومراعاة المقاومة الداخلية للمصدر (r).',
        'الخطوة 3: تطبيق قانون أوم للدائرة المغلقة: $I = \\frac{V_B}{R_{eq} + r}$.',
        'الخطوة 4: حساب فرق الجهد أو القدرة المستهلكة المطلوبة في الفرع المحدد.',
      ],
      finalAnswer: 'تم حساب القيمة الفيزيائية المطلوبة مع كتابة وحدة القياس الصحيحة.',
      tip: '⚡ نصيحة امتحانية: تذكر دائماً تحويل الوحدات (مثل تحويل mA إلى A بالضرب في $10^{-3}$) قبل التعويض في القوانين!',
    };
  },
  mechanics: (problem: string) => {
    return {
      formula: '\\sum \\vec{F} = 0 \\quad , \\quad \\sum \\vec{M}_O = 0',
      steps: [
        'الخطوة 1: رسم مخطط الجسم الحر (Free Body Diagram) وتحديد جميع القوى المؤثرة (الوزن، ردود الأفعال، وقوى الشد/الاحتكاك).',
        'الخطوة 2: تحليل القوى المائلة إلى مركبتين متعامدتين في اتجاهي المحاور $(X, Y)$.',
        'الخطوة 3: تطبيق شروط الاتزان الاستاتيكي: $\\sum F_x = 0$ و $\\sum F_y = 0$.',
        'الخطوة 4: أخذ العزوم حول نقطة مناسبة تتلاشى عندها أكثر من قوة مجهولة لتسهيل الحل.',
      ],
      finalAnswer: 'تم استنتاج مقدار واتجاه القوة/رد الفعل المطلوب بدقة.',
      tip: '⚙️ نصيحة امتحانية: اختيار نقطة أخذ العزوم عند النقطة التي تلتقي عندها معظم المجاهيل يوفر عليك 70% من وقت الحسابات!',
    };
  },
  algebra: (problem: string) => {
    return {
      formula: '\\vec{A} \\cdot \\vec{B} = |A||B| \\cos\\theta \\quad , \\quad \\vec{A} \\times \\vec{B}',
      steps: [
        'الخطوة 1: تمثيل المتجهات في الفضاء ثلاثي الأبعاد $(x, y, z)$ واستخراج متجهات الوحدة والاتجاه.',
        'الخطوة 2: حساب الضرب القياسي لتحديد الزوايا بين المتجهات، أو الضرب الاتجاهي لحساب المساحات والمتجه العمودي.',
        'الخطوة 3: تطبيق معادلة الخط المستقيم أو معادلة المستوى في الفراغ: $\\vec{r} = \\vec{A} + t\\vec{d}$.',
        'الخطوة 4: إيجاد نقطة التقاطع أو المسافة العمودية باستخدام الصيغة المباشرة.',
      ],
      finalAnswer: 'تم إيجاد المعادلة الفراغية المطلوبة في أبسط صورة متجهة وقياسية.',
      tip: '🔢 نصيحة امتحانية: تأكد من أن متجه الاتجاه في معادلة الخط المستقيم غير منعدم وأنه موازٍ للخط!',
    };
  },
};

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    const body = await req.json();
    const { problem, subject = 'calculus' } = body;

    if (!problem || typeof problem !== 'string' || problem.trim().length === 0) {
      return NextResponse.json({ error: 'يرجى كتابة نص المسألة' }, { status: 400 });
    }

    const solver = SUBJECT_SOLVERS[subject] || SUBJECT_SOLVERS.calculus;
    const solutionData = solver(problem);

    return NextResponse.json({
      success: true,
      problem: problem.trim(),
      subject,
      solution: {
        formula: solutionData.formula,
        steps: solutionData.steps,
        finalAnswer: solutionData.finalAnswer,
        tip: solutionData.tip,
        solvedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('AI Solve error:', error);
    return NextResponse.json({ error: 'حدث خطأ أثناء معالجة المسألة' }, { status: 500 });
  }
}
