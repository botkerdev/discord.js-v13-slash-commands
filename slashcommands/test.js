module.exports = {
    name:"테스트",
    description: "성공이라고 대답함",
    async execute(interaction){
        await interaction.reply({ content: "성공." })
    }
}
