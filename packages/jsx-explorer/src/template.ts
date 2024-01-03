export const templateStr = `// @ts-expect-error
import { Template, Fragment, Dialog } from 'one-jsx-loader'
// @ts-expect-error
import { Form, FormItem, Grid, Column, Icon, Tag, Button, Input, Select } from './components'

function useHeader() {
  return <Fragment title="xxx" tips="zzz" />
}

function useForm() {
  return <Form ref="formRef" use={useForm} rules={rules}>
    <FormItem label="name" prop="name">
      <Input value="xxx" onFocus={handleFocus} onBlur={handleBlur} />
    </FormItem>
    <FormItem label="age" prop="age">
      <Input value="xxx">
        <Template slot="prefix">
          <Icon class="search" />
        </Template>
        <Template slot="suffix">
          <Icon class="calendar" />
        </Template>
      </Input>
    </FormItem>
    <Dialog visible={visible}>
      <Template slot="buttons">
        <Button type="primary" text="Confirm" onClick={handleConfirm} />
        <Button type="primary" text="Cancel" onClick={handleCancel} />
      </Template>
    </Dialog>
  </Form>
}

function useGrid() {
  const handleFocus = () => {}
  const handleChange = () => {}
  return <Grid>
    <Column field="name" title="Name" width={100} showOverflow />
    <Column field="status" title="Status" width={120}>
      <Tag resolve={({ row }) => {
        return {
          props: {
            light: 'light',
            type: 'error',
            value: row.status
          }
        }
      }} />
    </Column>
    <Column field="age" title="Age" width={80}>
      <Input />
      <Template slot="default" tips="xxx">
        <Input />
      </Template>
      <Template slot="header" tips="xxx" />
      <Template slot="edit">
        <Select clearable placeholder="please select..." onFocus={handleFocus} onChange={handleChange} />
      </Template>
    </Column>
  </Grid>
}
`;
