module.exports = grammar({
  name: 'css',

  extras: $ => [
    /\s/,
    $.comment,
  ],

  externals: $ => [
    $._descendant_operator,
  ],

  inline: $ => [
    $._top_level_item,
    $._block_item,
  ],

  rules: {
    stylesheet: $ => repeat($._top_level_item),

    _top_level_item: $ => choice(
      $.rule_set,
      $.import_statement,
      $.media_statement,
      $.charset_statement,
      $.at_rule
    ),

    // Statements

    import_statement: $ => seq(
      '@import',
      $._value,
      commaSep($._query),
      ';'
    ),

    media_statement: $ => seq(
      '@media',
      commaSep1($._query),
      $.block
    ),

    charset_statement: $ => seq(
      '@charset',
      $._value,
      ';'
    ),

    at_rule: $ => seq(
      $.at_keyword,
      commaSep($._query),
      choice(';', $.block)
    ),

    // Rule sets

    rule_set: $ => seq(
      $.selectors,
      $.block
    ),

    selectors: $ => commaSep1($._selector),

    block: $ => seq('{', repeat($._block_item), '}'),

    _block_item: $ => choice(
      $.declaration,
      $._top_level_item
    ),

    // Selectors

    _selector: $ => choice(
      $.universal_selector,
      alias($.identifier, $.tag_name),
      $.class_selector,
      $.nesting_selector,
      $.pseudo_class_selector,
      $.pseudo_element_selector,
      $.id_selector,
      $.attribute_selector,
      $.child_selector,
      $.descendant_selector
    ),

    nesting_selector: $ => '&',

    universal_selector: $ => '*',

    class_selector: $ => seq(
      optional($._selector),
      '.',
      alias($.identifier, $.class_name),
    ),

    pseudo_class_selector: $ => seq(
      optional($._selector),
      ':',
      alias($.identifier, $.class_name),
      optional($.arguments)
    ),

    pseudo_element_selector: $ => seq(
      optional($._selector),
      '::',
      alias($.identifier, $.tag_name)
    ),

    id_selector: $ => seq(
      optional($._selector),
      '#',
      alias($.identifier, $.id_name)
    ),

    attribute_selector: $ => seq(
      optional($._selector),
      '[',
      alias($.identifier, $.attribute_name),
      optional(seq(
        choice('=', '~=', '^=', '|=', '*=', '$='),
        $._value
      )),
      ']'
    ),

    child_selector: $ => prec.left(seq($._selector, '>', $._selector)),

    descendant_selector: $ => prec.left(seq($._selector, $._descendant_operator, $._selector)),

    // Declarations

    declaration: $ => prec(1, seq(
      alias($.identifier, $.property_name),
      ':',
      $._value,
      repeat(seq(
        optional(','),
        $._value
      )),
      ';'
    )),

    // Media queries

    _query: $ => choice(
      alias($.identifier, $.keyword_query),
      $.feature_query,
      $.binary_query,
      $.negated_query,
      $.parenthesized_query
    ),

    feature_query: $ => seq(
      '(',
      alias($.identifier, $.feature_name),
      ':',
      $._value,
      ')'
    ),

    parenthesized_query: $ => seq(
      '(',
      $._query,
      ')'
    ),

    binary_query: $ => prec.left(seq(
      $._query,
      choice('and', 'or'),
      $._query
    )),

    negated_query: $ => prec(1, seq(
      'not',
      $._query
    )),

    // Property Values

    _value: $ => choice(
      alias($.identifier, $.keyword_value),
      $.color_value,
      $.integer_value,
      $.float_value,
      $.string_value,
      $.call_expression
    ),

    color_value: $ => /#[0-9a-fA-F]{3,8}/,

    string_value: $ => token(choice(
      seq("'", /([^']|\\.)+/, "'"),
      seq('"', /([^"]|\\.)+/, '"')
    )),

    integer_value: $ => seq(
      token(seq(
        optional(choice('+', '-')),
        /\d+/
      )),
      optional($.unit)
    ),

    float_value: $ => seq(
      token(seq(
        optional(choice('+', '-')),
        /\d*/,
        choice(
          seq('.', /\d+/),
          seq('e', optional('-'), /\d+/),
          seq('.', /\d+/, 'e', optional('-'), /\d+/)
        )
      )),
      optional($.unit)
    ),

    unit: $ => token.immediate(/[a-z]+/),

    call_expression: $ => seq(
      alias($.identifier, $.function_name),
      $.arguments
    ),

    arguments: $ => seq(
      token.immediate('('),
      commaSep($._value),
      ')'
    ),

    identifier: $ => /[a-zA-Z-_]+/,

    at_keyword: $ => /@[a-zA-Z-_]+/,

    comment: $ => token(choice(
      seq('//', /.*/),
      seq(
        '/*',
        /[^*]*\*+([^/*][^*]*\*+)*/,
        '/'
      )
    ))
  }
})

function commaSep (rule) {
  return optional(commaSep1(rule))
}

function commaSep1 (rule) {
  return seq(rule, repeat(seq(',', rule)))
}