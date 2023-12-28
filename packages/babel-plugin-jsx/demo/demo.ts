function reactive(obj: any) {
  return obj;
}

export default function useMetaForm() {
  const op = reactive({
    component: 'AuiForm',
    props: {},
    slots: {
      default: [
        {
          key: 'unitCodeList',
          props: {},
          slots: {
            label: {
              props: {
                label: '',
              },
            },
            default: {
              component: '',
              props: {
                clearable: true,
              },
              events: {},
            },
          },
        },
        {
          key: 'creationDate',
          props: {},
          slots: {
            label: {
              props: {
                label: '',
              },
            },
            default: {
              component: '',
              props: {
                clearable: true,
                format: 'yyyy-MM-dd HH:mm:ss',
                type: 'datetimerange',
                'value-format': 'yyyy-MM-dd HH:mm:ss',
              },
              events: {},
            },
          },
        },
      ],
    },
  });
  return op;
}
