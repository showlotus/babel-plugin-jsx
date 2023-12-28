export const templateStr = `export function useFn() {
  return <Form ref="formRef" use={useForm} rules={rules}>
    <FormItem label="name" prop="name">
      <Input value="xxx" onFocus={handleFocus} onBlur={handleBlur} />
    </FormItem>
    <FormItem label="age" prop="age">
      <Input value="xxx">
        <template slot="prefix">
          <Icon class="search" />
        </template>
        <template slot="suffix">
          <Icon class="calendar" />
        </template>
      </Input>
    </FormItem>
  </Form>
}
`;
