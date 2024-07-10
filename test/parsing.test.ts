import { parser } from '../src/handlebarParser';
import { logTree } from './treePrinter';

// The lezer library gave some very obscure example on how to test with some defined 'schema' to match 
// against. I'm going to ignore that for now and just test with outputs to verify they are being parsed right

type TestCase = {
  input: string;
  parsed: string;
  description: string;
  singleTest?: boolean;
};

/**
 * Generally speaking, used this online tool to verify parsing and add unit tests: https://lezer-playground.vercel.app/
 * @returns 
 */
function generateHandlebarParserTestCases(): Array<TestCase> {
  return [
    {
      input: `Some string input`,
      parsed: `Template(Input(Text))`,
      description: `Simple text input`,
    },
    {
      input: `{{variable}}`,
      parsed: `Template(Input(Directive(Expression(OpeneningMustache,ResolvableItem(VariableIdentifier(Identifier)),ClosingMustache))))`,
      description: `Variable reference only`,
    },
    {
      input: `{{ nested.variable }}`,
      parsed: `Template(Input(Directive(Expression(OpeneningMustache,Space,ResolvableItem(VariableIdentifier(Identifier,Identifier)),Space,ClosingMustache))))`,
      description: `Nested variable reference only`,
    },
    {
      input: `This is a simple string with a variable {{variable}}`,
      parsed: `Template(Input(Text),Input(Directive(Expression(OpeneningMustache,ResolvableItem(VariableIdentifier(Identifier)),ClosingMustache))))`,
      description: `Simple string with a variable`,
    },
    {
      input: `{{#if true}}Hello{{/if}}`,
      parsed: `Template(Input(Directive(Block(ConditionalOpen(OpeneningMustache,BlockOpenDelim,if,Space,ResolvableItem(VariableIdentifier(Identifier)),ClosingMustache),Input(Text),ClosingBlock(OpeneningMustache,BlockCloseDelim,if,ClosingMustache)))))`,
      description: `Simple block`,
    },
    {
      input: `{{#if true}}Hello{{else}}Goodbye{{/if}}`,
      parsed: `Template(Input(Directive(Block(ConditionalOpen(OpeneningMustache,BlockOpenDelim,if,Space,ResolvableItem(VariableIdentifier(Identifier)),ClosingMustache),Input(Text),ConditionalElse(OpeneningMustache,else,ClosingMustache),Input(Text),ClosingBlock(OpeneningMustache,BlockCloseDelim,if,ClosingMustache)))))`,
      description: `Block with else`,
    },
    {
      input: `Here is a variable {{ nested.items.0.id }} and a block: {{#if true}}Hello{{/if}}`,
      parsed: `Template(Input(Text),Input(Directive(Expression(OpeneningMustache,Space,ResolvableItem(VariableIdentifier(Identifier,Identifier,Number,Identifier)),Space,ClosingMustache))),Input(Text),Input(Directive(Block(ConditionalOpen(OpeneningMustache,BlockOpenDelim,if,Space,ResolvableItem(VariableIdentifier(Identifier)),ClosingMustache),Input(Text),ClosingBlock(OpeneningMustache,BlockCloseDelim,if,ClosingMustache)))))`,
      description: `Variable and block`,
    },
    {
      input: '{{#with subscription as | Subscription |}}({{status}}) {{SubscriptionLines.0.ProductVariant.Product.title}} (x{{SubscriptionLines.0.quantity}}) {{#if (comparison SubscriptionLines.length "gt" 1)}}(and {{(integerArithmeticImmediate SubscriptionLines.length "-" 1)}} other{{#if (comparison SubscriptionLines.length "gt" 2)}}s{{/if}}){{/if}} every {{BillingPolicy.intervalCount}} {{BillingPolicy.interval}}{{#if (comparison BillingPolicy.intervalCount "gt" 1)}}s{{/if}} for {{totalPrice}}, set to renew on {{formatDate nextBillingDate "M/DD"}}{{/with}}',
      parsed: 'Template(Input(Directive(Block(WithBlockOpen(OpeneningMustache,BlockOpenDelim,with,Space,ResolvableItem(VariableIdentifier(Identifier)),BlockAlias(Space,Space,Space,Identifier,Space),ClosingMustache),Input(Text),Input(Directive(Expression(OpeneningMustache,ResolvableItem(VariableIdentifier(Identifier)),ClosingMustache))),Input(Text),Input(Directive(Expression(OpeneningMustache,ResolvableItem(VariableIdentifier(Identifier,Number,Identifier,Identifier,Identifier)),ClosingMustache))),Input(Text),Input(Directive(Expression(OpeneningMustache,ResolvableItem(VariableIdentifier(Identifier,Number,Identifier)),ClosingMustache))),Input(Text),Input(Directive(Block(ConditionalOpen(OpeneningMustache,BlockOpenDelim,if,Space,ResolvableItem(FunctionCall(FunctionName(Identifier),Space,FunctionParameter(VariableIdentifier(Identifier,Identifier),Space,FunctionParameter(Primitive(String),Space,FunctionParameter(Primitive(Number)))))),ClosingMustache),Input(Text),Input(Directive(Expression(OpeneningMustache,ResolvableItem(FunctionCall(FunctionName(Identifier),Space,FunctionParameter(VariableIdentifier(Identifier,Identifier),Space,FunctionParameter(Primitive(String),Space,FunctionParameter(Primitive(Number)))))),ClosingMustache))),Input(Text),Input(Directive(Block(ConditionalOpen(OpeneningMustache,BlockOpenDelim,if,Space,ResolvableItem(FunctionCall(FunctionName(Identifier),Space,FunctionParameter(VariableIdentifier(Identifier,Identifier),Space,FunctionParameter(Primitive(String),Space,FunctionParameter(Primitive(Number)))))),ClosingMustache),Input(Text),ClosingBlock(OpeneningMustache,BlockCloseDelim,if,ClosingMustache)))),Input(Text),ClosingBlock(OpeneningMustache,BlockCloseDelim,if,ClosingMustache)))),Input(Text),Input(Directive(Expression(OpeneningMustache,ResolvableItem(VariableIdentifier(Identifier,Identifier)),ClosingMustache))),Input(Text),Input(Directive(Expression(OpeneningMustache,ResolvableItem(VariableIdentifier(Identifier,Identifier)),ClosingMustache))),Input(Directive(Block(ConditionalOpen(OpeneningMustache,BlockOpenDelim,if,Space,ResolvableItem(FunctionCall(FunctionName(Identifier),Space,FunctionParameter(VariableIdentifier(Identifier,Identifier),Space,FunctionParameter(Primitive(String),Space,FunctionParameter(Primitive(Number)))))),ClosingMustache),Input(Text),ClosingBlock(OpeneningMustache,BlockCloseDelim,if,ClosingMustache)))),Input(Text),Input(Directive(Expression(OpeneningMustache,ResolvableItem(VariableIdentifier(Identifier)),ClosingMustache))),Input(Text),Input(Directive(Expression(OpeneningMustache,ResolvableItem(VariableIdentifier(Identifier)),Space,⚠))),Input(Text),ClosingBlock(OpeneningMustache,BlockCloseDelim,with,ClosingMustache)))))',
      description: 'Complex example',
      singleTest: true,
    }
  ];
}

describe('Parsing tests', () => {
  const onlyRunSingleTestData = generateHandlebarParserTestCases().filter(
      ({ singleTest }) => singleTest,
    );

  const runTest = (testCase: TestCase) => {
    const { input, parsed, description } = testCase;
    test(description, () => {
      const tree = parser.parse(input);

      console.log(`[INFO] Parsed tree: ${tree.toString()}`);
      console.log(`[INFO] Expected output: ${parsed}`);
      logTree(tree, input);
      // expect(testTree(tree, parsed)).not.toThrow();
      expect(tree.toString()).toEqual(parsed);
    });
  };

  if (onlyRunSingleTestData.length > 0) {
    runTest(onlyRunSingleTestData[0]);
  } else {
    generateHandlebarParserTestCases().forEach((testCase) =>
      runTest(testCase)
    );
  }
})