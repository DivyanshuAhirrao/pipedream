import common from "../common/common.mjs";

export default {
  ...common,
  key: "you_need_a_budget-spending-in-category",
  name: "New Spending In Category",
  description: "Emit new event for every spending in a category. [See the docs](https://api.youneedabudget.com/v1#/Transactions/getTransactionsByCategory)",
  version: "0.0.1",
  type: "source",
  dedupe: "unique",
  props: {
    ...common.props,
    categoryId: {
      propDefinition: [
        common.props.app,
        "categoryId",
        (c) => ({
          budgetId: c.budgetId,
        }),
      ],
      withLabel: true,
    },
    sinceDate: {
      propDefinition: [
        common.props.app,
        "date",
      ],
      label: "Since Date",
      optional: true,
    },
  },
  methods: {
    ...common.methods,
    generateMeta(event) {
      const {
        id,
        date,
        amount,
        category_name: category,
      } = event;
      const spent = this.app.convertFromMilliunit(amount);
      return {
        id,
        summary: `New transaction in ${category} category: ${spent}`,
        ts: Date.parse(date),
      };
    },
  },
  async run() {
    const lastKnowledgeOfServer = this.getLastKnowledgeOfServer();
    const {
      server_knowledge: serverKnowledge,
      transactions = [],
    } = await this.app.getTransactionsByCategory({
      budgetId: this.budgetId,
      categoryId: this.categoryId.value,
      sinceDate: this.sinceDate || undefined,
      lastKnowledgeOfServer,
    });
    this.setLastKnowledgeOfServer(serverKnowledge);
    for (const transaction of transactions) {
      const meta = this.generateMeta(transaction);
      this.$emit(transaction, meta);
    }
  },
};
