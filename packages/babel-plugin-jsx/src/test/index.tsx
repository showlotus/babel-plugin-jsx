// @ts-expect-error
import { Dialog, Fragment, Template } from 'one-jsx-loader'
// @ts-expect-error
import { Button, Form, FormItem, Icon, Input, Modal } from './components'


function useForm() {
  const visible1 = false;
  const visible2 = false;
  const handleConfirm = () => {}
  const handleCancel = () => {}
  return <Fragment title="aaaa" tips="bbbb">
    <Form></Form>
    <Dialog visible={visible1}>
      <Template slot="buttons">
        <Button type="primary" text="确定" onClick={handleConfirm} />
        <Button type="primary" text="取消" onClick={handleCancel} />
      </Template>
    </Dialog>
    <Dialog visible={visible2} />
  </Fragment>
}


export function useFn() {
  const a: number = 1;
  const b: any = 3;
  const c = a + b;
  const d = 12 as any;
  const e = c + d;
  console.log(e);
  const rules = {};
  const visible = false;
  const onClose = () => {};
  const handleFocus = () => {};
  const handleBlur = () => {};
  return <Form ref="formRef" use={useForm} rules={rules}>
    <Modal visible={visible} onClose={onClose} resolve={(row: any) => {
      console.log(row)
    }}>
    </Modal>
    <Input />
    <FormItem label="name" prop="name">
      <Input value="xxx" onFocus={handleFocus} onBlur={handleBlur} />
    </FormItem>
    <FormItem label="age" prop="age">
      <Input value="xxx">
        <Template slot="prefix" width={100}>
          <Icon class="search" />
        </Template>
        <Template slot="suffix">
          <Icon class="calendar" />
        </Template>
      </Input>
    </FormItem>
  </Form>
}
