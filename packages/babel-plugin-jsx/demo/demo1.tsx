/**
 * @jsx
 * <div></div>
 */
// const App = () => <>Hello World</>

const Child = () => {
  return (
    <AuiInput value={'xxxx'}>
      <AuiSelect>
        <AuiOption>1</AuiOption>
        <AuiOption>2</AuiOption>
      </AuiSelect>
      <tempate slot="header">
        <div></div>
      </tempate>
      <tempate slot="footer">
        <div></div>
      </tempate>
      <div>
        <span></span>
      </div>
      <></>
    </AuiInput>
  );
};

const a = 1;
const b = () => {
  return (
    <>
      <div>
        <span></span>
      </div>
    </>
  );
};
